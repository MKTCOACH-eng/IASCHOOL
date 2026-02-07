import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// POST - Verificar un pago B2B
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede verificar pagos' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, internalNotes } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago requerido' }, { status: 400 });
    }

    const payment = await prisma.schoolB2BPayment.update({
      where: { id: paymentId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: user.id,
        internalNotes
      },
      include: {
        schoolSubscription: {
          include: { school: true }
        }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error verifying B2B payment:', error);
    return NextResponse.json({ error: 'Error al verificar pago' }, { status: 500 });
  }
}
