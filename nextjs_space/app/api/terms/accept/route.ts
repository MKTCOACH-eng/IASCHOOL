import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { TermsType } from '@prisma/client';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// POST - Aceptar términos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const { termsId, context } = body;

    if (!termsId) {
      return NextResponse.json({ error: 'termsId requerido' }, { status: 400 });
    }

    // Verificar que los términos existen y están activos
    const terms = await prisma.termsAndConditions.findUnique({
      where: { id: termsId }
    });

    if (!terms || !terms.isActive) {
      return NextResponse.json({ error: 'Términos no válidos' }, { status: 400 });
    }

    // Obtener IP y User Agent de los headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Crear o actualizar aceptación
    const acceptance = await prisma.userTermsAcceptance.upsert({
      where: {
        userId_termsId: {
          userId: user.id,
          termsId
        }
      },
      update: {
        acceptedAt: new Date(),
        ipAddress,
        userAgent,
        context
      },
      create: {
        userId: user.id,
        termsId,
        ipAddress,
        userAgent,
        context
      }
    });

    return NextResponse.json(acceptance);
  } catch (error) {
    console.error('Error accepting terms:', error);
    return NextResponse.json({ error: 'Error al aceptar términos' }, { status: 500 });
  }
}

// GET - Verificar si el usuario ha aceptado términos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Obtener términos activos aplicables al usuario
    const activeTerms = await prisma.termsAndConditions.findMany({
      where: {
        isActive: true,
        isMandatory: true,
        ...(type && { type: type as TermsType }),
        OR: [
          { schoolId: null },
          { schoolId: user.schoolId || undefined }
        ]
      }
    });

    // Obtener aceptaciones del usuario
    const acceptances = await prisma.userTermsAcceptance.findMany({
      where: {
        userId: user.id,
        termsId: { in: activeTerms.map(t => t.id) }
      }
    });

    const acceptedIds = new Set(acceptances.map(a => a.termsId));

    const pendingTerms = activeTerms.filter(t => !acceptedIds.has(t.id));

    return NextResponse.json({
      allAccepted: pendingTerms.length === 0,
      pendingTerms,
      acceptances
    });
  } catch (error) {
    console.error('Error checking terms:', error);
    return NextResponse.json({ error: 'Error al verificar términos' }, { status: 500 });
  }
}
