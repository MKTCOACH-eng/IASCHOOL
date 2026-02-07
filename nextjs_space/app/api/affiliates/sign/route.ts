import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// POST - Firmar petición de afiliado
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Solo padres pueden firmar
    if (user.role !== 'PADRE') {
      return NextResponse.json({ error: 'Solo padres pueden firmar' }, { status: 403 });
    }

    const body = await request.json();
    const { referralCode, termsAccepted } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Código de referido requerido' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'Debes aceptar los términos' }, { status: 400 });
    }

    // Buscar el referido
    const referral = await prisma.affiliateReferral.findUnique({
      where: { referralCode },
      include: { school: true }
    });

    if (!referral) {
      return NextResponse.json({ error: 'Código de referido no válido' }, { status: 404 });
    }

    // Verificar que no haya expirado
    if (referral.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Este link de referido ha expirado' }, { status: 400 });
    }

    // Verificar que el firmante sea del mismo colegio
    if (user.schoolId !== referral.schoolId) {
      return NextResponse.json({ error: 'Debes pertenecer al mismo colegio para firmar' }, { status: 403 });
    }

    // Verificar que no sea el mismo que creó el referido
    if (user.id === referral.referrerId) {
      return NextResponse.json({ error: 'No puedes firmar tu propia petición' }, { status: 400 });
    }

    // Verificar si ya firmó
    const existingSignature = await prisma.affiliatePetitionSignature.findUnique({
      where: {
        referralId_signerId: {
          referralId: referral.id,
          signerId: user.id
        }
      }
    });

    if (existingSignature) {
      return NextResponse.json({ error: 'Ya has firmado esta petición' }, { status: 400 });
    }

    // Crear firma
    const signature = await prisma.affiliatePetitionSignature.create({
      data: {
        referralId: referral.id,
        signerId: user.id,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      }
    });

    // Actualizar contador de firmas
    await prisma.affiliateReferral.update({
      where: { id: referral.id },
      data: { totalSignatures: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      signature,
      message: 'Has firmado la petición. Recibirás $200 MXN de descuento si el colegio activa IA School.'
    });
  } catch (error) {
    console.error('Error signing petition:', error);
    return NextResponse.json({ error: 'Error al firmar petición' }, { status: 500 });
  }
}
