import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { PlanType } from '@prisma/client';

interface SessionUser {
  id: string;
  role: string;
}

// GET - Listar acuerdos con colegios
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

    const agreements = await prisma.schoolAgreement.findMany({
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            email: true,
            phone: true,
            _count: {
              select: { students: true, users: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(agreements);
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json({ error: 'Error al obtener acuerdos' }, { status: 500 });
  }
}

// POST - Crear acuerdo con colegio
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
    const {
      schoolId,
      planType,
      pricePerStudent,
      iaSchoolShare,
      schoolShare,
      setupFee,
      setupFeeStatus,
      ecommerceServiceFee,
      ecommerceServiceFeeFixed,
      specialTerms
    } = body;

    if (!schoolId || !planType || !pricePerStudent) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const agreement = await prisma.schoolAgreement.upsert({
      where: { schoolId },
      update: {
        planType: planType as PlanType,
        pricePerStudent: parseFloat(pricePerStudent),
        iaSchoolShare: parseFloat(iaSchoolShare || 50),
        schoolShare: parseFloat(schoolShare || 50),
        setupFee: parseFloat(setupFee),
        setupFeeStatus: setupFeeStatus || 'pending',
        ecommerceServiceFee: ecommerceServiceFee ? parseFloat(ecommerceServiceFee) : null,
        ecommerceServiceFeeFixed: ecommerceServiceFeeFixed ? parseFloat(ecommerceServiceFeeFixed) : null,
        specialTerms
      },
      create: {
        schoolId,
        planType: planType as PlanType,
        pricePerStudent: parseFloat(pricePerStudent),
        iaSchoolShare: parseFloat(iaSchoolShare || 50),
        schoolShare: parseFloat(schoolShare || 50),
        setupFee: parseFloat(setupFee),
        setupFeeStatus: setupFeeStatus || 'pending',
        ecommerceServiceFee: ecommerceServiceFee ? parseFloat(ecommerceServiceFee) : null,
        ecommerceServiceFeeFixed: ecommerceServiceFeeFixed ? parseFloat(ecommerceServiceFeeFixed) : null,
        specialTerms
      },
      include: {
        school: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    return NextResponse.json(agreement);
  } catch (error) {
    console.error('Error creating agreement:', error);
    return NextResponse.json({ error: 'Error al crear acuerdo' }, { status: 500 });
  }
}
