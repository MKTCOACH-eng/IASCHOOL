import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - Get single report card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };

    const reportCard = await db.reportCard.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            group: true,
            parents: { select: { id: true, name: true, email: true } },
          },
        },
        grades: {
          include: { subject: true },
        },
        school: true,
      },
    });

    if (!reportCard) {
      return NextResponse.json({ error: 'Boleta no encontrada' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'PADRE') {
      const isParent = reportCard.student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent || reportCard.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (reportCard.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    return NextResponse.json(reportCard);
  } catch (error) {
    console.error('Error fetching report card:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT - Update report card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };
    if (!['ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { grades, teacherComments, principalComments, status } = body;

    const reportCard = await db.reportCard.findUnique({
      where: { id },
      include: { grades: true },
    });

    if (!reportCard || reportCard.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Boleta no encontrada' }, { status: 404 });
    }

    // Calculate new average if grades updated
    let finalAverage = reportCard.finalAverage;
    if (grades && grades.length > 0) {
      const validGrades = grades.filter((g: { grade: number }) => typeof g.grade === 'number');
      if (validGrades.length > 0) {
        finalAverage = validGrades.reduce((sum: number, g: { grade: number }) => sum + g.grade, 0) / validGrades.length;
      }
    }

    // Update grades if provided
    if (grades) {
      // Delete existing grades and create new ones
      await db.reportCardGrade.deleteMany({ where: { reportCardId: id } });
      await db.reportCardGrade.createMany({
        data: grades.map((g: { subjectId: string; grade: number; gradeText?: string; comments?: string }) => ({
          reportCardId: id,
          subjectId: g.subjectId,
          grade: g.grade,
          gradeText: g.gradeText,
          comments: g.comments,
        })),
      });
    }

    const updated = await db.reportCard.update({
      where: { id },
      data: {
        finalAverage,
        teacherComments: teacherComments !== undefined ? teacherComments : reportCard.teacherComments,
        principalComments: principalComments !== undefined ? principalComments : reportCard.principalComments,
        status: status || reportCard.status,
        publishedAt: status === 'PUBLISHED' && reportCard.status !== 'PUBLISHED' ? new Date() : reportCard.publishedAt,
      },
      include: {
        student: { include: { group: true } },
        grades: { include: { subject: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating report card:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete report card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const reportCard = await db.reportCard.findUnique({ where: { id } });
    if (!reportCard || reportCard.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Boleta no encontrada' }, { status: 404 });
    }

    await db.reportCard.delete({ where: { id } });

    return NextResponse.json({ message: 'Boleta eliminada' });
  } catch (error) {
    console.error('Error deleting report card:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
