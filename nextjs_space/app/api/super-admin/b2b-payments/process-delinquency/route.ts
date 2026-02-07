import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// POST - Procesar morosidad de colegios (ejecutar periódicamente)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede procesar morosidad' }, { status: 403 });
    }

    const now = new Date();
    const results = {
      markedAsGracePeriod: 0,
      markedAsOverdue: 0,
      suspended: 0
    };

    // Obtener todas las suscripciones activas
    const subscriptions = await prisma.schoolSubscription.findMany({
      where: {
        status: 'ACTIVE',
        b2bPaymentStatus: { notIn: ['SUSPENDED', 'CANCELLED'] }
      },
      include: {
        b2bPayments: {
          where: {
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    for (const sub of subscriptions) {
      const overduePayments = sub.b2bPayments.filter(p => p.dueDate < now);
      
      if (overduePayments.length === 0) continue;

      const oldestOverdue = overduePayments[0];
      const daysSincedue = Math.floor((now.getTime() - oldestOverdue.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSincedue > sub.b2bGracePeriodDays + 30) {
        // Más de gracia + 30 días = Suspender
        await prisma.schoolSubscription.update({
          where: { id: sub.id },
          data: {
            b2bPaymentStatus: 'SUSPENDED',
            b2bSuspendedAt: now,
            status: 'SUSPENDED'
          }
        });
        
        // Marcar los pagos como OVERDUE
        await prisma.schoolB2BPayment.updateMany({
          where: { id: { in: overduePayments.map(p => p.id) } },
          data: { status: 'OVERDUE' }
        });
        
        results.suspended++;
      } else if (daysSincedue > sub.b2bGracePeriodDays) {
        // Pasó el período de gracia = OVERDUE
        await prisma.schoolSubscription.update({
          where: { id: sub.id },
          data: {
            b2bPaymentStatus: 'OVERDUE',
            b2bDelinquentSince: sub.b2bDelinquentSince || now
          }
        });
        results.markedAsOverdue++;
      } else if (daysSincedue > 0) {
        // En período de gracia
        await prisma.schoolSubscription.update({
          where: { id: sub.id },
          data: {
            b2bPaymentStatus: 'GRACE_PERIOD',
            b2bDelinquentSince: sub.b2bDelinquentSince || now
          }
        });
        results.markedAsGracePeriod++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscriptions.length,
      results
    });
  } catch (error) {
    console.error('Error processing delinquency:', error);
    return NextResponse.json({ error: 'Error al procesar morosidad' }, { status: 500 });
  }
}
