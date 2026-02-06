import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
  name: string;
}

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { studentId } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || new Date().getFullYear().toString();

    // Verify access to student
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.schoolId,
        ...(user.role === 'PADRE' ? {
          parents: { some: { id: user.id } }
        } : {}),
        ...(user.role === 'PROFESOR' ? {
          group: { teacherId: user.id }
        } : {})
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado o sin acceso' }, { status: 404 });
    }

    // Get all graded submissions for the student
    const submissions = await db.submission.findMany({
      where: {
        studentId,
        status: 'REVIEWED',
        task: {
          status: { in: ['PUBLISHED', 'CLOSED'] },
          ...(period.match(/^\d{4}$/) ? {
            dueDate: {
              gte: new Date(`${period}-01-01`),
              lt: new Date(`${parseInt(period) + 1}-01-01`)
            }
          } : {})
        }
      },
      include: {
        task: {
          include: {
            subject: true
          }
        }
      }
    });

    // Group by subject
    const gradesBySubject: Map<string, {
      subject: string;
      color: string;
      tasksCount: number;
      totalScore: number;
      count: number;
    }> = new Map();

    for (const submission of submissions) {
      const subjectName = submission.task.subject?.name || 'Sin materia';
      const subjectColor = submission.task.subject?.color || '#6B7280';
      
      if (!gradesBySubject.has(subjectName)) {
        gradesBySubject.set(subjectName, {
          subject: subjectName,
          color: subjectColor,
          tasksCount: 0,
          totalScore: 0,
          count: 0
        });
      }

      const subjectData = gradesBySubject.get(subjectName)!;
      subjectData.tasksCount++;
      
      if (submission.score !== null) {
        // Normalize score to 100
        const normalizedScore = (submission.score / submission.task.maxScore) * 100;
        subjectData.totalScore += normalizedScore;
        subjectData.count++;
      }
    }

    // Calculate averages
    const grades = Array.from(gradesBySubject.values()).map(g => ({
      subject: g.subject,
      color: g.color,
      tasksCount: g.tasksCount,
      average: g.count > 0 ? g.totalScore / g.count : null
    }));

    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Error fetching grades preview:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
