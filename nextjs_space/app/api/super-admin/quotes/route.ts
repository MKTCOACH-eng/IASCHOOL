import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// Generar número de cotización
async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `COT-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET - Listar cotizaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { schoolName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        selectedPlan: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { negotiations: true } }
      }
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 500 });
  }
}

// POST - Crear cotización
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
      schoolName,
      contactName,
      contactEmail,
      contactPhone,
      address,
      estimatedStudents,
      selectedPlanId,
      setupFee,
      monthlyTotal,
      annualTotal,
      iaSchoolMonthly,
      schoolMonthly,
      setupFeeDiscount,
      customPricePerStudent,
      notes,
      internalNotes
    } = body;

    if (!schoolName || !contactName || !contactEmail || !estimatedStudents) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const quoteNumber = await generateQuoteNumber();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de vigencia

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        schoolName,
        contactName,
        contactEmail,
        contactPhone,
        address,
        estimatedStudents: parseInt(estimatedStudents),
        selectedPlanId,
        setupFee: parseFloat(setupFee),
        monthlyTotal: parseFloat(monthlyTotal),
        annualTotal: parseFloat(annualTotal),
        iaSchoolMonthly: parseFloat(iaSchoolMonthly),
        schoolMonthly: parseFloat(schoolMonthly),
        setupFeeDiscount: setupFeeDiscount ? parseFloat(setupFeeDiscount) : null,
        customPricePerStudent: customPricePerStudent ? parseFloat(customPricePerStudent) : null,
        notes,
        internalNotes,
        expiresAt,
        createdById: user.id
      },
      include: {
        selectedPlan: true,
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Crear registro de negociación inicial
    await prisma.quoteNegotiation.create({
      data: {
        quoteId: quote.id,
        action: 'created',
        notes: 'Cotización creada',
        createdById: user.id
      }
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Error al crear cotización' }, { status: 500 });
  }
}
