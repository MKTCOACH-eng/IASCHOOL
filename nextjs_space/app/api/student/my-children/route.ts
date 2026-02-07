import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    if (user.role !== 'PADRE') {
      return NextResponse.json({ error: 'Solo padres pueden acceder' }, { status: 403 });
    }

    const children = await db.student.findMany({
      where: {
        parents: { some: { id: user.id } },
        isActive: true,
      },
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
