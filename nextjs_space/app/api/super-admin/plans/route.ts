import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// GET - Listar planes de suscripción
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

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { pricePerStudent: 'asc' },
      include: {
        _count: {
          select: {
            schoolSubscriptions: true,
            parentSubscriptions: true
          }
        }
      }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Error al obtener planes' }, { status: 500 });
  }
}

// POST - Crear o actualizar plan
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
    const { id, name, type, pricePerStudent, iaSchoolShare, schoolShare, description, features, annualDiscountMonths } = body;

    if (!name || !type || !pricePerStudent) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const data = {
      name,
      type,
      pricePerStudent: parseFloat(pricePerStudent),
      iaSchoolShare: parseFloat(iaSchoolShare || 50),
      schoolShare: parseFloat(schoolShare || 50),
      description,
      features: features || [],
      annualDiscountMonths: annualDiscountMonths || 2
    };

    let plan;
    if (id) {
      plan = await prisma.subscriptionPlan.update({
        where: { id },
        data
      });
    } else {
      plan = await prisma.subscriptionPlan.create({ data });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error saving plan:', error);
    return NextResponse.json({ error: 'Error al guardar plan' }, { status: 500 });
  }
}
