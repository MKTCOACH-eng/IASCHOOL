import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

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
    const now = new Date();
    const results: any[] = [];

    // Obtener configuraciones activas
    const configs = await prisma.reminderConfig.findMany({
      where: {
        schoolId,
        enabled: true
      }
    });

    for (const config of configs) {
      let usersToNotify: any[] = [];
      let referenceData: { type: string; id: string; message: string }[] = [];

      switch (config.reminderType) {
        case 'APPOINTMENT':
          // Citas próximas
          const upcomingAppointments = await prisma.appointment.findMany({
            where: {
              schoolId,
              dateTime: {
                gte: now,
                lte: new Date(now.getTime() + config.daysBeforeDue * 24 * 60 * 60 * 1000)
              },
              status: 'CONFIRMED'
            },
            include: {
              requester: true,
              teacher: true
            }
          });
          
          upcomingAppointments.forEach(apt => {
            const dateStr = new Date(apt.dateTime).toLocaleDateString('es-MX');
            referenceData.push({
              type: 'appointment',
              id: apt.id,
              message: `Tienes una cita programada el ${dateStr} - ${apt.reason}`
            });
            if (apt.requester) usersToNotify.push(apt.requester);
            if (apt.teacher) usersToNotify.push(apt.teacher);
          });
          break;

        case 'TASK_PENDING':
          // Tareas sin calificar (para profesores)
          const pendingTasks = await prisma.task.findMany({
            where: {
              group: { schoolId },
              status: 'PUBLISHED',
              dueDate: { lte: now }
            },
            include: {
              teacher: true,
              _count: { select: { submissions: { where: { grade: null } } } }
            }
          });

          pendingTasks
            .filter(t => t._count.submissions > 0)
            .forEach(task => {
              referenceData.push({
                type: 'task',
                id: task.id,
                message: `Tienes ${task._count.submissions} tareas pendientes de calificar en "${task.title}"`
              });
              if (task.teacher) usersToNotify.push(task.teacher);
            });
          break;

        case 'PAYMENT_DUE':
          // Pagos pendientes (para padres)
          const pendingCharges = await prisma.charge.findMany({
            where: {
              schoolId,
              status: 'PENDING',
              dueDate: {
                lte: new Date(now.getTime() + config.daysBeforeDue * 24 * 60 * 60 * 1000)
              }
            },
            include: {
              student: {
                include: { parents: true }
              }
            }
          });

          pendingCharges.forEach(charge => {
            charge.student.parents.forEach(parent => {
              referenceData.push({
                type: 'payment',
                id: charge.id,
                message: `Pago pendiente: ${charge.concept} - $${charge.amount} vence el ${new Date(charge.dueDate!).toLocaleDateString('es-MX')}`
              });
              usersToNotify.push(parent);
            });
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

          const allUsers = await prisma.user.findMany({
            where: { schoolId, isActive: true, role: { in: config.targetRoles as any[] } }
          });

          upcomingEvents.forEach(event => {
            referenceData.push({
              type: 'event',
              id: event.id,
              message: `Evento próximo: ${event.title} - ${new Date(event.startDate).toLocaleDateString('es-MX')}`
            });
          });
          if (upcomingEvents.length > 0) {
            usersToNotify = allUsers;
          }
          break;

        case 'SURVEY_PENDING':
          // Encuestas sin responder
          const activeSurveys = await prisma.survey.findMany({
            where: {
              schoolId,
              status: 'PUBLISHED',
              endDate: { gte: now }
            }
          });

          for (const survey of activeSurveys) {
            const targetUsers = await prisma.user.findMany({
              where: {
                schoolId,
                isActive: true,
                role: { in: survey.targetAudience as any[] },
                NOT: {
                  surveyResponses: { some: { surveyId: survey.id } }
                }
              }
            });

            targetUsers.forEach(u => {
              referenceData.push({
                type: 'survey',
                id: survey.id,
                message: `Encuesta pendiente: "${survey.title}" - Vence el ${new Date(survey.endDate!).toLocaleDateString('es-MX')}`
              });
            });
            usersToNotify = [...usersToNotify, ...targetUsers];
          }
          break;
      }

      // Eliminar duplicados
      const uniqueUsers = [...new Map(usersToNotify.map(u => [u.id, u])).values()];

      // Crear logs de reminders enviados
      for (let i = 0; i < uniqueUsers.length && i < referenceData.length; i++) {
        const userToNotify = uniqueUsers[i];
        const ref = referenceData[i] || referenceData[0];

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
              schoolId: schoolId!,
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
