import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Listar todas las insignias disponibles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const badges = await prisma.gamificationBadge.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { rarity: 'desc' }, { name: 'asc' }]
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Error al obtener insignias' }, { status: 500 });
  }
}

// POST - Crear nueva insignia (solo ADMIN/SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      rarity = 'COMMON',
      pointsAwarded = 10,
      iconEmoji,
      iconUrl,
      isAutomatic = false,
      criteria,
      isSecret = false
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    const badge = await prisma.gamificationBadge.create({
      data: {
        name,
        description,
        category,
        rarity,
        pointsAwarded,
        iconEmoji,
        iconUrl,
        isAutomatic,
        criteria,
        isSecret
      }
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ error: 'Error al crear insignia' }, { status: 500 });
  }
}
