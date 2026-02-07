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

// GET - Obtener evaluaciones de rendimiento
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    const whereClause: any = { schoolId: user.schoolId };

    // PROFESOR solo ve sus propias evaluaciones
    if (user.role === 'PROFESOR') {
      whereClause.teacherId = user.id;
    } else if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    const reviews = await prisma.teacherPerformanceReview.findMany({
      where: whereClause,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Error al obtener evaluaciones' }, { status: 500 });
  }
}

// POST - Crear evaluación de rendimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden crear evaluaciones' }, { status: 403 });
    }

    const body = await request.json();
    const {
      teacherId,
      periodStart,
      periodEnd,
      overallScore,
      attendanceScore,
      taskCompletionScore,
      communicationScore,
      studentGradesScore,
      punctualityScore,
      strengths,
      areasToImprove,
      comments,
      goals
    } = body;

    if (!teacherId || !overallScore) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const review = await prisma.teacherPerformanceReview.create({
      data: {
        schoolId: user.schoolId!,
        teacherId,
        reviewerId: user.id,
        periodStart: new Date(periodStart || new Date().setMonth(new Date().getMonth() - 1)),
        periodEnd: new Date(periodEnd || new Date()),
        overallScore,
        attendanceScore,
        taskCompletionScore,
        communicationScore,
        studentGradesScore,
        punctualityScore,
        strengths,
        areasToImprove,
        comments,
        goals,
        status: 'submitted'
      },
      include: {
        teacher: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error al crear evaluación' }, { status: 500 });
  }
}
