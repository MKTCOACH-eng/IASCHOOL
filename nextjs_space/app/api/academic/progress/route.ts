import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - Get student academic progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const user = session.user as { id: string; role: string; schoolId: string };

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requerido' }, { status: 400 });
    }

    // Verify access
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { select: { id: true } },
        group: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    if (user.role === 'PADRE') {
      const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    // Get all report cards for this student
    const reportCards = await db.reportCard.findMany({
      where: {
        studentId,
        status: user.role === 'PADRE' ? 'PUBLISHED' : undefined,
      },
      include: {
        grades: {
          include: { subject: true },
        },
      },
      orderBy: [
        { schoolYear: 'desc' },
        { period: 'asc' },
      ],
    });

    // Get submissions (tasks) with grades
    const submissions = await db.submission.findMany({
      where: {
        studentId,
        status: 'REVIEWED',
        score: { not: null },
      },
      include: {
        task: {
          include: { subject: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    });

    // Get group average for comparison
    let groupAverage = null;
    if (student.groupId) {
      const groupStudents = await db.student.findMany({
        where: { groupId: student.groupId, isActive: true },
        select: { id: true },
      });

      const groupReportCards = await db.reportCard.findMany({
        where: {
          studentId: { in: groupStudents.map((s: { id: string }) => s.id) },
          status: 'PUBLISHED',
        },
        select: { finalAverage: true },
      });

      if (groupReportCards.length > 0) {
        const validAverages = groupReportCards.filter((rc: { finalAverage: number | null }) => rc.finalAverage !== null);
        if (validAverages.length > 0) {
          groupAverage = validAverages.reduce((sum: number, rc: { finalAverage: number | null }) => sum + (rc.finalAverage || 0), 0) / validAverages.length;
        }
      }
    }

    // Build progress data by subject
    const subjectProgress: Record<string, {
      subjectId: string;
      subjectName: string;
      subjectColor: string;
      grades: { period: string; schoolYear: string; grade: number }[];
      currentAverage: number | null;
      trend: string;
    }> = {};

    reportCards.forEach(rc => {
      rc.grades.forEach((g: { subject: { id: string; name: string; color: string }; grade: number }) => {
        if (!subjectProgress[g.subject.id]) {
          subjectProgress[g.subject.id] = {
            subjectId: g.subject.id,
            subjectName: g.subject.name,
            subjectColor: g.subject.color,
            grades: [],
            currentAverage: null,
            trend: 'stable',
          };
        }
        subjectProgress[g.subject.id].grades.push({
          period: rc.period,
          schoolYear: rc.schoolYear,
          grade: g.grade,
        });
      });
    });

    // Calculate trends and current averages
    Object.values(subjectProgress).forEach(sp => {
      if (sp.grades.length > 0) {
        sp.currentAverage = sp.grades[sp.grades.length - 1].grade;
        if (sp.grades.length >= 2) {
          const lastGrade = sp.grades[sp.grades.length - 1].grade;
          const prevGrade = sp.grades[sp.grades.length - 2].grade;
          if (lastGrade > prevGrade + 0.5) sp.trend = 'up';
          else if (lastGrade < prevGrade - 0.5) sp.trend = 'down';
        }
      }
    });

    // Recent task performance
    const recentTasks = submissions.slice(0, 10).map(s => ({
      taskTitle: s.task.title,
      subject: s.task.subject?.name || 'General',
      score: s.score,
      maxScore: s.task.maxScore,
      percentage: s.task.maxScore ? ((s.score || 0) / s.task.maxScore) * 100 : null,
      submittedAt: s.submittedAt,
    }));

    // Calculate overall statistics
    const latestReportCard = reportCards.find(rc => rc.status === 'PUBLISHED');
    const overallStats = {
      currentAverage: latestReportCard?.finalAverage || null,
      groupAverage,
      attendance: latestReportCard?.attendance || null,
      totalReportCards: reportCards.length,
      absences: latestReportCard?.absences || 0,
      tardies: latestReportCard?.tardies || 0,
    };

    // Identify areas of concern (grades below 7)
    const areasOfConcern = Object.values(subjectProgress)
      .filter(sp => sp.currentAverage !== null && sp.currentAverage < 7)
      .map(sp => ({
        subject: sp.subjectName,
        grade: sp.currentAverage,
        trend: sp.trend,
      }));

    // Identify strengths (grades above 9)
    const strengths = Object.values(subjectProgress)
      .filter(sp => sp.currentAverage !== null && sp.currentAverage >= 9)
      .map(sp => ({
        subject: sp.subjectName,
        grade: sp.currentAverage,
        trend: sp.trend,
      }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        group: student.group?.name,
      },
      overallStats,
      subjectProgress: Object.values(subjectProgress),
      recentTasks,
      areasOfConcern,
      strengths,
      reportCards: reportCards.map(rc => ({
        id: rc.id,
        period: rc.period,
        schoolYear: rc.schoolYear,
        finalAverage: rc.finalAverage,
        status: rc.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
