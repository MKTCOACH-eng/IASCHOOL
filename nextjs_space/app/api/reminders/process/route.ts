import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Role, TaskStatus, AppointmentStatus, SurveyStatus } from '@prisma/client';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// POST - Procesar y enviar reminders pendientes (llamado por cron o manualmente)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'Sin colegio asignado' }, { status: 400 });
    }

    const now = new Date();
    const results: { type: string; user: string; message: string }[] = [];

    // Obtener configuraciones activas
    const configs = await prisma.reminderConfig.findMany({
      where: {
        schoolId,
        enabled: true
      }
    });

    for (const config of configs) {
      const usersToNotify: { id: string; name: string; email: string }[] = [];
      const referenceData: { type: string; id: string; message: string }[] = [];

      switch (config.reminderType) {
        case 'APPOINTMENT':
          // Citas próximas
          const upcomingAppointments = await prisma.appointment.findMany({
            where: {
              teacher: { schoolId },
              scheduledDate: {
                gte: now,
                lte: new Date(now.getTime() + config.daysBeforeDue * 24 * 60 * 60 * 1000)
              },
              status: AppointmentStatus.CONFIRMED
            },
            include: {
              parent: { select: { id: true, name: true, email: true } },
              teacher: { select: { id: true, name: true, email: true } }
            }
          });
          
          upcomingAppointments.forEach(apt => {
            const dateStr = new Date(apt.scheduledDate).toLocaleDateString('es-MX');
            referenceData.push({
              type: 'appointment',
              id: apt.id,
              message: `Tienes una cita programada el ${dateStr} - ${apt.subject}`
            });
            usersToNotify.push(apt.parent);
            usersToNotify.push(apt.teacher);
          });
          break;

        case 'TASK_PENDING':
          // Tareas sin calificar (para profesores)
          const pendingTasks = await prisma.task.findMany({
            where: {
              group: { schoolId },
              status: TaskStatus.PUBLISHED,
              dueDate: { lte: now }
            },
            include: {
              teacher: { select: { id: true, name: true, email: true } },
              submissions: {
                where: { score: null },
                select: { id: true }
              }
            }
          });

          pendingTasks
            .filter(t => t.submissions.length > 0)
            .forEach(task => {
              referenceData.push({
                type: 'task',
                id: task.id,
                message: `Tienes ${task.submissions.length} entregas pendientes de calificar en "${task.title}"`
              });
              usersToNotify.push(task.teacher);
            });
          break;

        case 'PAYMENT_DUE':
          // Pagos pendientes (para padres)
          const pendingCharges = await prisma.charge.findMany({
            where: {
              schoolId,
              status: 'PENDIENTE',
              dueDate: {
                lte: new Date(now.getTime() + config.daysBeforeDue * 24 * 60 * 60 * 1000)
              }
            },
            include: {
              student: {
                include: { 
                  parents: { select: { id: true, name: true, email: true } } 
                }
              }
            }
          });

          pendingCharges.forEach(charge => {
            if (charge.student?.parents) {
              charge.student.parents.forEach(parent => {
                referenceData.push({
                  type: 'payment',
                  id: charge.id,
                  message: `Pago pendiente: ${charge.concept} - $${charge.amount}${charge.dueDate ? ` vence el ${new Date(charge.dueDate).toLocaleDateString('es-MX')}` : ''}`
                });
                usersToNotify.push(parent);
              });
            }
          });
          break;

        case 'EVENT_UPCOMING':
          // Eventos próximos
          const upcomingEvents = await prisma.event.findMany({
            where: {
              schoolId,
              startDate: {
                gte: now,
                lte: new Date(now.getTime() + config.daysBeforeDue * 24 * 60 * 60 * 1000)
              }
            }
          });

          // Obtener todos los usuarios del colegio con los roles objetivo
          const targetRoles = (config.targetRoles || ['PADRE', 'PROFESOR']) as Role[];
          const allUsers = await prisma.user.findMany({
            where: { 
              schoolId, 
              role: { in: targetRoles } 
            },
            select: { id: true, name: true, email: true }
          });

          upcomingEvents.forEach(event => {
            referenceData.push({
              type: 'event',
              id: event.id,
              message: `Evento próximo: ${event.title} - ${new Date(event.startDate).toLocaleDateString('es-MX')}`
            });
          });
          if (upcomingEvents.length > 0) {
            usersToNotify.push(...allUsers);
          }
          break;

        case 'SURVEY_PENDING':
          // Encuestas sin responder
          const activeSurveys = await prisma.survey.findMany({
            where: {
              schoolId,
              status: SurveyStatus.ACTIVE,
              endsAt: { gte: now }
            }
          });

          for (const survey of activeSurveys) {
            // Obtener usuarios que aún no han respondido
            const surveyTargetRoles = (survey.targetRoles || ['PADRE', 'PROFESOR']) as Role[];
            const targetUsers = await prisma.user.findMany({
              where: {
                schoolId,
                role: { in: surveyTargetRoles },
                NOT: {
                  surveyResponses: { some: { surveyId: survey.id } }
                }
              },
              select: { id: true, name: true, email: true }
            });

            targetUsers.forEach(u => {
              referenceData.push({
                type: 'survey',
                id: survey.id,
                message: `Encuesta pendiente: "${survey.title}"${survey.endsAt ? ` - Vence el ${new Date(survey.endsAt).toLocaleDateString('es-MX')}` : ''}`
              });
              usersToNotify.push(u);
            });
          }
          break;
      }

      // Eliminar duplicados
      const uniqueUsers = [...new Map(usersToNotify.map(u => [u.id, u])).values()];

      // Crear logs de reminders enviados
      for (let i = 0; i < Math.min(uniqueUsers.length, referenceData.length); i++) {
        const userToNotify = uniqueUsers[i];
        const ref = referenceData[i] || referenceData[0];
        if (!ref) continue;

        // Verificar si ya se envió este reminder recientemente
        const recentReminder = await prisma.reminderLog.findFirst({
          where: {
            userId: userToNotify.id,
            reminderType: config.reminderType,
            referenceId: ref.id,
            sentAt: {
              gte: new Date(now.getTime() - config.intervalDays * 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!recentReminder) {
          await prisma.reminderLog.create({
            data: {
              schoolId,
              reminderType: config.reminderType,
              userId: userToNotify.id,
              referenceType: ref.type,
              referenceId: ref.id,
              subject: config.customSubject || `Recordatorio: ${config.reminderType}`,
              message: config.customMessage || ref.message,
              sentViaEmail: config.sendEmail,
              sentViaPush: config.sendPush,
              sentViaInApp: config.sendInApp,
              status: 'sent',
              isAiGenerated: false
            }
          });

          results.push({
            type: config.reminderType,
            user: userToNotify.name,
            message: ref.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedConfigs: configs.length,
      remindersSent: results.length,
      details: results
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json({ error: 'Error al procesar reminders' }, { status: 500 });
  }
}
