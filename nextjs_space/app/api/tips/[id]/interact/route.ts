import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
}

// POST - Registrar interacción con un tip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id: tipId } = await params;
    const body = await request.json();
    const { interactionType } = body; // "like", "share", "save"

    if (!['like', 'share', 'save'].includes(interactionType)) {
      return NextResponse.json({ error: 'Tipo de interacción inválido' }, { status: 400 });
    }

    // Verificar si ya existe la interacción
    const existing = await prisma.tipInteraction.findUnique({
      where: {
        tipId_userId_interactionType: {
          tipId,
          userId: user.id,
          interactionType
        }
      }
    });

    if (existing) {
      // Toggle: eliminar si ya existe (para likes)
      if (interactionType === 'like') {
        await prisma.tipInteraction.delete({
          where: { id: existing.id }
        });
        await prisma.educationalTip.update({
          where: { id: tipId },
          data: { likeCount: { decrement: 1 } }
        });
        return NextResponse.json({ action: 'removed', interactionType });
      }
      return NextResponse.json({ action: 'exists', interactionType });
    }

    // Crear interacción
    await prisma.tipInteraction.create({
      data: {
        tipId,
        userId: user.id,
        interactionType
      }
    });

    // Actualizar contador
    const counterField = interactionType === 'like' ? 'likeCount' : 
                         interactionType === 'share' ? 'shareCount' : null;
    
    if (counterField) {
      await prisma.educationalTip.update({
        where: { id: tipId },
        data: { [counterField]: { increment: 1 } }
      });
    }

    return NextResponse.json({ action: 'added', interactionType });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Error al registrar interacción' }, { status: 500 });
  }
}
