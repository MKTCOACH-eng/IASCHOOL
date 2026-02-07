import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - List user's passkeys
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string };

    const passkeys = await prisma.userPasskey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(passkeys);
  } catch (error) {
    console.error('Error fetching passkeys:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Remove a passkey
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string };
    const { searchParams } = new URL(request.url);
    const passkeyId = searchParams.get('id');

    if (!passkeyId) {
      return NextResponse.json({ error: 'ID de passkey requerido' }, { status: 400 });
    }

    // Verify ownership
    const passkey = await prisma.userPasskey.findFirst({
      where: { id: passkeyId, userId: user.id }
    });

    if (!passkey) {
      return NextResponse.json({ error: 'Passkey no encontrado' }, { status: 404 });
    }

    await prisma.userPasskey.delete({ where: { id: passkeyId } });

    return NextResponse.json({ success: true, message: 'Passkey eliminado' });
  } catch (error) {
    console.error('Error deleting passkey:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
