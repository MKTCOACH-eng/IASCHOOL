import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// GET - Listar tarifas de setup
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tiers = await prisma.setupFeeTier.findMany({
      where: { isActive: true },
      orderBy: { minStudents: 'asc' }
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Error fetching setup fees:', error);
    return NextResponse.json({ error: 'Error al obtener tarifas' }, { status: 500 });
  }
}

// POST - Crear o actualizar tarifa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, minStudents, maxStudents, setupFee } = body;

    if (!name || minStudents === undefined || !setupFee) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const data = {
      name,
      minStudents: parseInt(minStudents),
      maxStudents: maxStudents ? parseInt(maxStudents) : null,
      setupFee: parseFloat(setupFee)
    };

    let tier;
    if (id) {
      tier = await prisma.setupFeeTier.update({
        where: { id },
        data
      });
    } else {
      tier = await prisma.setupFeeTier.create({ data });
    }

    return NextResponse.json(tier);
  } catch (error) {
    console.error('Error saving setup fee:', error);
    return NextResponse.json({ error: 'Error al guardar tarifa' }, { status: 500 });
  }
}
