import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Listar pedidos del proveedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: vendorId } = await params;
    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    // Verificar acceso
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, schoolId: user.schoolId }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && vendor.ownerId !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const whereClause: any = { vendorId };
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const orders = await prisma.vendorOrder.findMany({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular estadísticas
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + Number(o.vendorAmount), 0)
    };

    return NextResponse.json({ orders, stats });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

// PUT - Actualizar estado del pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: vendorId } = await params;
    const user = session.user as SessionUser;
    const body = await request.json();
    const { orderId, status, trackingNumber, internalNotes } = body;

    // Verificar acceso
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, schoolId: user.schoolId }
    });

    if (!vendor || (user.role !== 'ADMIN' && vendor.ownerId !== user.id)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'confirmed') updateData.confirmedAt = new Date();
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();
      if (status === 'cancelled') updateData.cancelledAt = new Date();
    }
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (internalNotes) updateData.internalNotes = internalNotes;

    const order = await prisma.vendorOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true } },
        items: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}
