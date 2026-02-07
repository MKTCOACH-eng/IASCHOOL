import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// POST - Otorgar insignia o puntos a un estudiante
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!['ADMIN', 'PROFESOR', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para otorgar recompensas' }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      badgeId,
      points,
      reason,
      category,
      referenceType,
      referenceId
    } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'ID de estudiante requerido' }, { status: 400 });
    }

    // Verificar que el estudiante pertenece al colegio del usuario
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.schoolId
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    const results: { badge?: unknown; points?: unknown } = {};

    // Otorgar insignia si se proporciona badgeId
    if (badgeId) {
      const badge = await prisma.gamificationBadge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        return NextResponse.json({ error: 'Insignia no encontrada' }, { status: 404 });
      }

      // Verificar si ya tiene la insignia
      const existingBadge = await prisma.studentBadge.findUnique({
        where: {
          studentId_badgeId: { studentId, badgeId }
        }
      });

      if (existingBadge) {
        return NextResponse.json({ error: 'El estudiante ya tiene esta insignia' }, { status: 400 });
      }

      const studentBadge = await prisma.studentBadge.create({
        data: {
          studentId,
          badgeId,
          awardedById: user.id,
          reason,
          referenceType,
          referenceId,
          pointsEarned: badge.pointsAwarded
        },
        include: { badge: true }
      });

      // Actualizar perfil con puntos de la insignia
      await updateStudentPoints(studentId, badge.pointsAwarded, `Insignia: ${badge.name}`, badge.category, user.id);

      results.badge = studentBadge;
    }

    // Otorgar puntos directamente si se proporciona
    if (points && points !== 0) {
      const pointsLog = await prisma.studentPointsLog.create({
        data: {
          studentId,
          points,
          reason: reason || (points > 0 ? 'Puntos otorgados' : 'Puntos deducidos'),
          category,
          referenceType,
          referenceId,
          awardedById: user.id
        }
      });

      await updateStudentProfile(studentId, points);
      results.points = pointsLog;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error awarding gamification:', error);
    return NextResponse.json({ error: 'Error al otorgar recompensa' }, { status: 500 });
  }
}

async function updateStudentPoints(
  studentId: string, 
  points: number, 
  reason: string, 
  category: string | null, 
  awardedById: string
) {
  await prisma.studentPointsLog.create({
    data: {
      studentId,
      points,
      reason,
      category: category as any,
      awardedById
    }
  });

  await updateStudentProfile(studentId, points);
}

async function updateStudentProfile(studentId: string, pointsDelta: number) {
  const profile = await prisma.studentGamificationProfile.findUnique({
    where: { studentId }
  });

  if (profile) {
    await prisma.studentGamificationProfile.update({
      where: { studentId },
      data: {
        totalPoints: { increment: pointsDelta },
        weeklyPoints: { increment: pointsDelta },
        monthlyPoints: { increment: pointsDelta },
        lastActivityDate: new Date()
      }
    });
  } else {
    await prisma.studentGamificationProfile.create({
      data: {
        studentId,
        totalPoints: Math.max(0, pointsDelta),
        weeklyPoints: Math.max(0, pointsDelta),
        monthlyPoints: Math.max(0, pointsDelta),
        lastActivityDate: new Date()
      }
    });
  }
}
