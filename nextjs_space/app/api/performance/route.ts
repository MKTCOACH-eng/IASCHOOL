import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener métricas de rendimiento de profesores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const period = searchParams.get('period') || 'month';

    // Solo ADMIN puede ver todos, PROFESOR solo el suyo
    if (user.role !== 'ADMIN' && user.role !== 'PROFESOR') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const targetTeacherId = user.role === 'PROFESOR' ? user.id : teacherId;

    // Calcular fechas del período
    const now = new Date();
    let periodStart: Date;
    
    switch (period) {
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Construir filtros
    const whereClause: any = {
      schoolId: user.schoolId,
      periodStart: { gte: periodStart },
    };

    if (targetTeacherId) {
      whereClause.teacherId = targetTeacherId;
    }

    // Obtener métricas
    const metrics = await prisma.teacherPerformanceMetric.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [{ teacherId: 'asc' }, { category: 'asc' }]
    });

    // Obtener profesores para comparativa (solo ADMIN)
    let teachers: { id: string; name: string; email: string }[] = [];
    if (user.role === 'ADMIN') {
      teachers = await prisma.user.findMany({
        where: {
          schoolId: user.schoolId,
          role: 'PROFESOR'
        },
        select: { id: true, name: true, email: true }
      });
    }

    // Calcular promedios por categoría
    const categoryAverages: Record<string, number[]> = {};
    metrics.forEach((m: any) => {
      if (!categoryAverages[m.category]) {
        categoryAverages[m.category] = [];
      }
      categoryAverages[m.category].push(Number(m.value));
    });

    const averages = Object.entries(categoryAverages).map(([category, values]) => ({
      category,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length
    }));

    return NextResponse.json({
      metrics,
      teachers,
      averages,
      period: { start: periodStart, end: now }
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 });
  }
}

// POST - Registrar métricas de rendimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden registrar métricas' }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, category, value, target, periodStart, periodEnd, notes } = body;

    if (!teacherId || !category || value === undefined) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const metric = await prisma.teacherPerformanceMetric.create({
      data: {
        schoolId: user.schoolId!,
        teacherId,
        category,
        value,
        target,
        periodStart: new Date(periodStart || new Date().setDate(1)),
        periodEnd: new Date(periodEnd || new Date()),
        notes
      },
      include: {
        teacher: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json({ error: 'Error al registrar métrica' }, { status: 500 });
  }
}
