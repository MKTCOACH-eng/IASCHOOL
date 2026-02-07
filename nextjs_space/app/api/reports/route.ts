import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener reportes disponibles y ejecuciones recientes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    // Tipos de reportes disponibles
    const reportTypes = [
      {
        type: 'ACADEMIC',
        name: 'Reporte Académico',
        description: 'Calificaciones, tareas y rendimiento de estudiantes',
        icon: 'GraduationCap'
      },
      {
        type: 'FINANCIAL',
        name: 'Reporte Financiero',
        description: 'Pagos, cobranza y morosidad',
        icon: 'DollarSign'
      },
      {
        type: 'ATTENDANCE',
        name: 'Reporte de Asistencia',
        description: 'Asistencias, faltas y retardos',
        icon: 'Calendar'
      },
      {
        type: 'COMMUNICATION',
        name: 'Reporte de Comunicación',
        description: 'Mensajes, anuncios y engagement',
        icon: 'MessageSquare'
      },
      {
        type: 'DISCIPLINE',
        name: 'Reporte de Disciplina',
        description: 'Incidentes y acciones correctivas',
        icon: 'AlertTriangle'
      },
      {
        type: 'HEALTH',
        name: 'Reporte de Enfermería',
        description: 'Visitas a enfermería y salud estudiantil',
        icon: 'Heart'
      },
      {
        type: 'PERFORMANCE',
        name: 'Rendimiento de Profesores',
        description: 'Métricas y evaluaciones de personal',
        icon: 'TrendingUp'
      },
      {
        type: 'ENROLLMENT',
        name: 'Reporte de Inscripciones',
        description: 'Preinscripciones y matrículas',
        icon: 'UserPlus'
      },
      {
        type: 'STORE',
        name: 'Reporte de Tienda',
        description: 'Ventas, productos y proveedores',
        icon: 'ShoppingBag'
      }
    ];

    // Ejecuciones recientes
    const recentExecutions = await prisma.reportExecution.findMany({
      where: { schoolId: user.schoolId },
      include: {
        generatedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Reportes programados
    const scheduledReports = await prisma.reportSchedule.findMany({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { nextRunAt: 'asc' }
    });

    return NextResponse.json({
      reportTypes,
      recentExecutions,
      scheduledReports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}

// POST - Generar un reporte
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

    const body = await request.json();
    const { reportType, name, parameters } = body;

    if (!reportType) {
      return NextResponse.json({ error: 'Tipo de reporte requerido' }, { status: 400 });
    }

    // Crear registro de ejecución
    const execution = await prisma.reportExecution.create({
      data: {
        schoolId: user.schoolId!,
        reportType,
        name: name || `Reporte ${reportType}`,
        parameters,
        status: 'running',
        generatedById: user.id
      }
    });

    // Generar datos del reporte (simplificado)
    let reportData: any = {};
    let rowCount = 0;

    switch (reportType) {
      case 'ACADEMIC':
        const grades = await prisma.reportCardGrade.findMany({
          where: { reportCard: { schoolId: user.schoolId } },
          include: {
            reportCard: { include: { student: true } },
            subject: true
          }
        });
        reportData = { grades };
        rowCount = grades.length;
        break;

      case 'FINANCIAL':
        const payments = await prisma.payment.findMany({
          where: { charge: { schoolId: user.schoolId } },
          include: { charge: true }
        });
        const charges = await prisma.charge.findMany({
          where: { schoolId: user.schoolId }
        });
        reportData = { payments, charges };
        rowCount = payments.length + charges.length;
        break;

      case 'ATTENDANCE':
        const attendance = await prisma.attendance.findMany({
          where: { student: { schoolId: user.schoolId } },
          include: { student: true }
        });
        reportData = { attendance };
        rowCount = attendance.length;
        break;

      case 'PERFORMANCE':
        const metrics = await prisma.teacherPerformanceMetric.findMany({
          where: { schoolId: user.schoolId },
          include: { teacher: { select: { id: true, name: true } } }
        });
        reportData = { metrics };
        rowCount = metrics.length;
        break;

      case 'STORE':
        const orders = await prisma.vendorOrder.findMany({
          where: { vendor: { schoolId: user.schoolId } },
          include: {
            vendor: { select: { name: true } },
            items: true
          }
        });
        reportData = { orders };
        rowCount = orders.length;
        break;

      default:
        reportData = { message: 'Tipo de reporte no implementado' };
    }

    // Actualizar ejecución con resultados
    const updatedExecution = await prisma.reportExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        rowCount
      }
    });

    return NextResponse.json({
      execution: updatedExecution,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
