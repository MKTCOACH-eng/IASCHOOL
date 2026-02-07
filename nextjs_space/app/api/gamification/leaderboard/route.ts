import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener tabla de clasificación
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!user.schoolId) {
      return NextResponse.json({ error: 'Sin colegio asignado' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const period = searchParams.get('period') || 'total'; // total, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '10');

    // Obtener estudiantes con sus perfiles de gamificación
    const where: Record<string, unknown> = {
      schoolId: user.schoolId,
      isActive: true
    };
    if (groupId) where.groupId = groupId;

    let orderByField = 'totalPoints';
    if (period === 'weekly') orderByField = 'weeklyPoints';
    if (period === 'monthly') orderByField = 'monthlyPoints';

    const profiles = await prisma.studentGamificationProfile.findMany({
      where: {
        student: where
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            group: { select: { name: true } }
          }
        }
      },
      orderBy: { [orderByField]: 'desc' },
      take: limit
    });

    // Agregar ranking
    const leaderboard = profiles.map((profile, index) => ({
      rank: index + 1,
      student: profile.student,
      points: period === 'weekly' 
        ? profile.weeklyPoints 
        : period === 'monthly' 
          ? profile.monthlyPoints 
          : profile.totalPoints,
      level: profile.currentLevel,
      levelName: profile.levelName,
      totalBadges: profile.totalBadges
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Error al obtener ranking' }, { status: 500 });
  }
}
