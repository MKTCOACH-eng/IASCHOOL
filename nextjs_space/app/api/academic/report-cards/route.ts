import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - List report cards
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const schoolYear = searchParams.get('schoolYear');
    const status = searchParams.get('status');
    const groupId = searchParams.get('groupId');

    const user = session.user as { id: string; role: string; schoolId: string };

    let whereClause: Record<string, unknown> = {
      schoolId: user.schoolId,
    };

    if (user.role === 'PADRE') {
      // Parents only see their children's report cards that are published
      const children = await db.student.findMany({
        where: {
          parents: { some: { id: user.id } },
          isActive: true,
        },
        select: { id: true },
      });
      whereClause.studentId = { in: children.map((c: { id: string }) => c.id) };
      whereClause.status = 'PUBLISHED';
    } else if (studentId) {
      whereClause.studentId = studentId;
    }

    if (groupId && user.role !== 'PADRE') {
      const studentsInGroup = await db.student.findMany({
        where: { groupId, isActive: true },
        select: { id: true },
      });
      whereClause.studentId = { in: studentsInGroup.map((s: { id: string }) => s.id) };
    }

    if (schoolYear) whereClause.schoolYear = schoolYear;
    if (status && user.role !== 'PADRE') whereClause.status = status;

    const reportCards = await db.reportCard.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            group: true,
          },
        },
        grades: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [
        { schoolYear: 'desc' },
        { period: 'asc' },
      ],
    });

    return NextResponse.json(reportCards);
  } catch (error) {
    console.error('Error fetching report cards:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create report card
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    if (!['ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, schoolYear, period, grades, teacherComments } = body;

    if (!studentId || !schoolYear || !period) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Calculate average if grades provided
    let finalAverage = null;
    if (grades && grades.length > 0) {
      const validGrades = grades.filter((g: { grade: number }) => typeof g.grade === 'number');
      if (validGrades.length > 0) {
        finalAverage = validGrades.reduce((sum: number, g: { grade: number }) => sum + g.grade, 0) / validGrades.length;
      }
    }

    // Get attendance data
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { group: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Calculate attendance stats
    const attendanceStats = await db.attendance.groupBy({
      by: ['status'],
      where: {
        studentId,
        date: {
          gte: new Date(`${schoolYear.split('-')[0]}-08-01`),
          lte: new Date(`${schoolYear.split('-')[1]}-07-31`),
        },
      },
      _count: true,
    });

    let absences = 0;
    let tardies = 0;
    let total = 0;
    attendanceStats.forEach((stat: { status: string; _count: number }) => {
      total += stat._count;
      if (stat.status === 'AUSENTE') absences += stat._count;
      if (stat.status === 'TARDANZA') tardies += stat._count;
    });

    const attendanceRate = total > 0 ? ((total - absences) / total) * 100 : null;

    const reportCard = await db.reportCard.create({
      data: {
        studentId,
        schoolId: user.schoolId,
        schoolYear,
        period,
        finalAverage,
        attendance: attendanceRate,
        absences,
        tardies,
        teacherComments,
        grades: grades ? {
          create: grades.map((g: { subjectId: string; grade: number; gradeText?: string; comments?: string }) => ({
            subjectId: g.subjectId,
            grade: g.grade,
            gradeText: g.gradeText,
            comments: g.comments,
          })),
        } : undefined,
      },
      include: {
        student: { include: { group: true } },
        grades: { include: { subject: true } },
      },
    });

    return NextResponse.json(reportCard, { status: 201 });
  } catch (error) {
    console.error('Error creating report card:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
