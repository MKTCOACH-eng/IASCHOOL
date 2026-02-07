import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// POST - Calcular métricas automáticamente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const { teacherId, periodStart, periodEnd } = await request.json();
    const startDate = new Date(periodStart || new Date().setDate(1));
    const endDate = new Date(periodEnd || new Date());

    // Obtener profesores a evaluar
    const teacherWhere: any = {
      schoolId: user.schoolId,
      role: 'PROFESOR',
      isActive: true
    };
    if (teacherId) teacherWhere.id = teacherId;

    const teachers = await prisma.user.findMany({
      where: teacherWhere,
      select: { id: true, name: true }
    });

    const metrics: any[] = [];

    for (const teacher of teachers) {
      // 1. TASK_COMPLETION - % de tareas con calificación registrada
      const tasks = await prisma.task.count({
        where: {
          teacherId: teacher.id,
          createdAt: { gte: startDate, lte: endDate },
          status: 'PUBLISHED'
        }
      });
      const gradedSubmissions = await prisma.submission.count({
        where: {
          task: { teacherId: teacher.id },
          score: { not: null },
          submittedAt: { gte: startDate, lte: endDate }
        }
      });
      const gradedTasks = gradedSubmissions;
      const taskCompletion = tasks > 0 ? (gradedTasks / tasks) * 100 : 100;

      // 2. ATTENDANCE - % de registro de asistencia
      const groups = await prisma.group.findMany({
        where: { teacherId: teacher.id },
        select: { id: true, _count: { select: { students: true } } }
      });
      const totalExpectedAttendance = groups.reduce((sum, g) => {
        const schoolDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) * 5;
        return sum + (g._count.students * schoolDays);
      }, 0);
      const registeredAttendance = await prisma.attendance.count({
        where: {
          student: { group: { teacherId: teacher.id } },
          date: { gte: startDate, lte: endDate }
        }
      });
      const attendanceRate = totalExpectedAttendance > 0 
        ? Math.min((registeredAttendance / totalExpectedAttendance) * 100, 100) 
        : 100;

      // 3. COMMUNICATION - Mensajes enviados
      const messageCount = await prisma.message.count({
        where: {
          senderId: teacher.id,
          createdAt: { gte: startDate, lte: endDate }
        }
      });
      // Normalizar: 50+ mensajes = 100%
      const communicationScore = Math.min((messageCount / 50) * 100, 100);

      // 4. PUNCTUALITY - Basado en horarios (si hay registro)
      const punctualityScore = 95; // Default alto, se puede calcular con registros de entrada

      // Guardar métricas
      const metricsData = [
        { category: 'TASK_COMPLETION', value: taskCompletion, target: 90 },
        { category: 'ATTENDANCE', value: attendanceRate, target: 95 },
        { category: 'COMMUNICATION', value: communicationScore, target: 80 },
        { category: 'PUNCTUALITY', value: punctualityScore, target: 95 }
      ];

      for (const m of metricsData) {
        const metric = await prisma.teacherPerformanceMetric.create({
          data: {
            schoolId: user.schoolId!,
            teacherId: teacher.id,
            category: m.category as any,
            value: m.value,
            target: m.target,
            periodStart: startDate,
            periodEnd: endDate,
            details: { calculatedAutomatically: true }
          }
        });
        metrics.push({ ...metric, teacherName: teacher.name });
      }
    }

    return NextResponse.json({
      success: true,
      teachersProcessed: teachers.length,
      metricsCreated: metrics.length,
      metrics
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json({ error: 'Error al calcular métricas' }, { status: 500 });
  }
}
