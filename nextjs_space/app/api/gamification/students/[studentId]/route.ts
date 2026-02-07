import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener perfil de gamificación de un estudiante
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { studentId } = await params;
    const user = session.user as SessionUser;

    // Verificar acceso al estudiante
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        OR: [
          { schoolId: user.schoolId },
          { parents: { some: { id: user.id } } }
        ]
      },
      select: { id: true, firstName: true, lastName: true, photoUrl: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Obtener o crear perfil de gamificación
    let profile = await prisma.studentGamificationProfile.findUnique({
      where: { studentId }
    });

    if (!profile) {
      profile = await prisma.studentGamificationProfile.create({
        data: { studentId }
      });
    }

    // Obtener insignias ganadas
    const badges = await prisma.studentBadge.findMany({
      where: { studentId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    });

    // Obtener historial de puntos reciente
    const recentPoints = await prisma.studentPointsLog.findMany({
      where: { studentId },
      orderBy: { earnedAt: 'desc' },
      take: 20
    });

    // Calcular nivel basado en puntos
    const level = calculateLevel(profile.totalPoints);

    return NextResponse.json({
      student,
      profile: {
        ...profile,
        ...level
      },
      badges,
      recentPoints
    });
  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
  }
}

function calculateLevel(points: number) {
  const levels = [
    { level: 1, name: 'Principiante', min: 0, max: 100 },
    { level: 2, name: 'Aprendiz', min: 100, max: 300 },
    { level: 3, name: 'Estudiante', min: 300, max: 600 },
    { level: 4, name: 'Aplicado', min: 600, max: 1000 },
    { level: 5, name: 'Destacado', min: 1000, max: 1500 },
    { level: 6, name: 'Brillante', min: 1500, max: 2200 },
    { level: 7, name: 'Experto', min: 2200, max: 3000 },
    { level: 8, name: 'Maestro', min: 3000, max: 4000 },
    { level: 9, name: 'Sabio', min: 4000, max: 5500 },
    { level: 10, name: 'Leyenda', min: 5500, max: Infinity }
  ];

  const currentLevel = levels.find(l => points >= l.min && points < l.max) || levels[0];
  const progress = currentLevel.max === Infinity 
    ? 100 
    : Math.floor(((points - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100);

  return {
    currentLevel: currentLevel.level,
    levelName: currentLevel.name,
    experienceToNextLevel: currentLevel.max === Infinity ? 0 : currentLevel.max - points,
    levelProgress: progress
  };
}
