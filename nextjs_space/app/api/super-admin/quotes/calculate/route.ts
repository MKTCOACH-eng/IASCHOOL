import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { PlanType } from '@prisma/client';

interface SessionUser {
  id: string;
  role: string;
}

// POST - Calcular cotización
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
    const { estimatedStudents, planType, customPricePerStudent } = body;

    if (!estimatedStudents || !planType) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const students = parseInt(estimatedStudents);

    // Obtener plan seleccionado
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { type: planType as PlanType }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    // Obtener tarifa de setup correspondiente
    const setupTier = await prisma.setupFeeTier.findFirst({
      where: {
        isActive: true,
        minStudents: { lte: students },
        OR: [
          { maxStudents: { gte: students } },
          { maxStudents: null }
        ]
      },
      orderBy: { minStudents: 'desc' }
    });

    // Calcular precios
    const pricePerStudent = customPricePerStudent 
      ? parseFloat(customPricePerStudent) 
      : Number(plan.pricePerStudent);
    
    const monthlyTotal = pricePerStudent * students;
    const annualTotal = monthlyTotal * 10; // 2 meses gratis
    const iaSchoolShare = Number(plan.iaSchoolShare) / 100;
    const schoolShare = Number(plan.schoolShare) / 100;
    
    const iaSchoolMonthly = monthlyTotal * iaSchoolShare;
    const schoolMonthly = monthlyTotal * schoolShare;
    const iaSchoolAnnual = annualTotal * iaSchoolShare;
    const schoolAnnual = annualTotal * schoolShare;

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        basePrice: Number(plan.pricePerStudent),
        features: plan.features
      },
      setupFee: setupTier ? Number(setupTier.setupFee) : 0,
      setupTierName: setupTier?.name || 'Enterprise',
      pricePerStudent,
      students,
      monthly: {
        total: monthlyTotal,
        iaSchool: iaSchoolMonthly,
        school: schoolMonthly
      },
      annual: {
        total: annualTotal,
        iaSchool: iaSchoolAnnual,
        school: schoolAnnual,
        savings: monthlyTotal * 2 // Ahorro por pago anual
      },
      shares: {
        iaSchool: Number(plan.iaSchoolShare),
        school: Number(plan.schoolShare)
      }
    });
  } catch (error) {
    console.error('Error calculating quote:', error);
    return NextResponse.json({ error: 'Error al calcular cotización' }, { status: 500 });
  }
}
