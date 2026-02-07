import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// GET - Listar todos los pagos B2B de colegios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede acceder' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const schoolId = searchParams.get('schoolId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (year) where.periodYear = parseInt(year);
    if (month) where.periodMonth = parseInt(month);
    if (schoolId) {
      where.schoolSubscription = { schoolId };
    }

    const payments = await prisma.schoolB2BPayment.findMany({
      where,
      include: {
        schoolSubscription: {
          include: {
            school: { select: { id: true, name: true, code: true } },
            plan: { select: { name: true, type: true } }
          }
        }
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }, { createdAt: 'desc' }]
    });

    // Resumen de morosidad
    const summary = await prisma.schoolSubscription.groupBy({
      by: ['b2bPaymentStatus'],
      _count: true
    });

    // Balance total pendiente
    const totalPending = await prisma.schoolB2BPayment.aggregate({
      where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
      _sum: { expectedAmount: true, paidAmount: true }
    });

    return NextResponse.json({
      payments,
      summary,
      totalPending: {
        expected: totalPending._sum.expectedAmount || 0,
        paid: totalPending._sum.paidAmount || 0,
        balance: Number(totalPending._sum.expectedAmount || 0) - Number(totalPending._sum.paidAmount || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching B2B payments:', error);
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 });
  }
}

// POST - Registrar un pago B2B recibido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede registrar pagos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      schoolSubscriptionId,
      paymentType = 'MONTHLY_SHARE',
      periodMonth,
      periodYear,
      paidAmount,
      paymentMethod,
      referenceNumber,
      bankName,
      notes
    } = body;

    if (!schoolSubscriptionId || !paidAmount) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    // Obtener suscripción del colegio
    const subscription = await prisma.schoolSubscription.findUnique({
      where: { id: schoolSubscriptionId },
      include: {
        school: true,
        plan: true,
        parentSubscriptions: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }

    // Calcular monto esperado
    const activeStudents = subscription.parentSubscriptions.length;
    const pricePerStudent = subscription.customPricePerStudent || subscription.plan.pricePerStudent;
    const sharePercentage = subscription.customIaSchoolShare || subscription.plan.iaSchoolShare;
    const expectedAmount = Number(pricePerStudent) * activeStudents * (Number(sharePercentage) / 100);

    // Verificar si ya existe un registro para este período
    const existingPayment = await prisma.schoolB2BPayment.findFirst({
      where: {
        schoolSubscriptionId,
        periodMonth,
        periodYear,
        paymentType: paymentType as any
      }
    });

    let payment;
    if (existingPayment) {
      // Actualizar pago existente
      payment = await prisma.schoolB2BPayment.update({
        where: { id: existingPayment.id },
        data: {
          paidAmount: Number(existingPayment.paidAmount) + Number(paidAmount),
          paymentMethod,
          referenceNumber,
          bankName,
          notes,
          paidAt: new Date(),
          status: Number(existingPayment.paidAmount) + Number(paidAmount) >= Number(existingPayment.expectedAmount) 
            ? 'RECEIVED' : 'PARTIAL'
        }
      });
    } else {
      // Crear nuevo registro de pago
      const dueDate = new Date(periodYear, periodMonth - 1, subscription.billingDay);
      payment = await prisma.schoolB2BPayment.create({
        data: {
          schoolSubscriptionId,
          paymentType: paymentType as any,
          periodMonth,
          periodYear,
          expectedAmount,
          paidAmount,
          totalStudents: activeStudents,
          pricePerStudent,
          sharePercentage,
          paymentMethod,
          referenceNumber,
          bankName,
          notes,
          dueDate,
          paidAt: new Date(),
          status: paidAmount >= expectedAmount ? 'RECEIVED' : 'PARTIAL'
        }
      });
    }

    // Actualizar estado de la suscripción
    await prisma.schoolSubscription.update({
      where: { id: schoolSubscriptionId },
      data: {
        b2bPaymentStatus: 'CURRENT',
        b2bLastPaymentDate: new Date(),
        b2bDelinquentSince: null,
        b2bSuspendedAt: null
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error registering B2B payment:', error);
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 });
  }
}
