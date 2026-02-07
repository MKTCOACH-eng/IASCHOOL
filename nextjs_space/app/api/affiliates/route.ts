import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener mi link de afiliado o lista de afiliados (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    // Si es SUPER_ADMIN, puede ver todos
    if (user.role === 'SUPER_ADMIN') {
      const affiliates = await prisma.affiliateReferral.findMany({
        where: schoolId ? { schoolId } : {},
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          school: { select: { id: true, name: true, code: true } },
          signatures: {
            include: {
              signer: { select: { id: true, name: true, email: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(affiliates);
    }

    // Para padres, mostrar su propio referido si existe
    if (user.role === 'PADRE' && user.schoolId) {
      const myReferral = await prisma.affiliateReferral.findFirst({
        where: {
          referrerId: user.id,
          schoolId: user.schoolId
        },
        include: {
          signatures: {
            include: {
              signer: { select: { id: true, name: true } }
            }
          }
        }
      });

      return NextResponse.json(myReferral);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json({ error: 'Error al obtener afiliados' }, { status: 500 });
  }
}

// POST - Crear link de afiliado (solo padres del colegio)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Solo padres pueden crear links de afiliado
    if (user.role !== 'PADRE') {
      return NextResponse.json({ error: 'Solo padres pueden crear links de afiliado' }, { status: 403 });
    }

    // Debe pertenecer a un colegio
    if (!user.schoolId) {
      return NextResponse.json({ error: 'Debes pertenecer a un colegio' }, { status: 400 });
    }

    const body = await request.json();
    const { termsAccepted } = body;

    if (!termsAccepted) {
      return NextResponse.json({ error: 'Debes aceptar los términos del programa de afiliados' }, { status: 400 });
    }

    // Verificar si ya tiene un link activo
    const existing = await prisma.affiliateReferral.findFirst({
      where: {
        referrerId: user.id,
        schoolId: user.schoolId,
        status: { in: ['PENDING', 'SCHOOL_REGISTERED', 'ACTIVE'] }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Ya tienes un link de afiliado activo', existing }, { status: 400 });
    }

    // Generar código único
    const referralCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Expira en 30 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const referral = await prisma.affiliateReferral.create({
      data: {
        referrerId: user.id,
        schoolId: user.schoolId,
        referralCode,
        referralLink: `/affiliate/${referralCode}`,
        expiresAt
      },
      include: {
        school: { select: { name: true } }
      }
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json({ error: 'Error al crear link de afiliado' }, { status: 500 });
  }
}
