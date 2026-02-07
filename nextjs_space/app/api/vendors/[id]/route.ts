import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener proveedor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as SessionUser;

    const vendor = await prisma.vendor.findFirst({
      where: {
        id,
        schoolId: user.schoolId
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true } },
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { products: true, orders: true } }
      }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Error al obtener proveedor' }, { status: 500 });
  }
}

// PUT - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as SessionUser;
    const body = await request.json();

    // Verificar permisos
    const existingVendor = await prisma.vendor.findFirst({
      where: { id, schoolId: user.schoolId }
    });

    if (!existingVendor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    // Solo ADMIN o el dueño pueden editar
    if (user.role !== 'ADMIN' && existingVendor.ownerId !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const updateData: any = {};
    const allowedFields = [
      'name', 'description', 'logoUrl', 'contactName', 'contactEmail',
      'contactPhone', 'address', 'city', 'state', 'zipCode', 'rfc',
      'businessName', 'shippingEnabled', 'enviaApiKey'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    // Solo ADMIN puede cambiar status y comisión
    if (user.role === 'ADMIN') {
      if (body.status) {
        updateData.status = body.status;
        if (body.status === 'APPROVED') {
          updateData.approvedById = user.id;
          updateData.approvedAt = new Date();
        }
      }
      if (body.commissionRate !== undefined) {
        updateData.commissionRate = body.commissionRate;
      }
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { products: true, orders: true } }
      }
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

// DELETE - Eliminar proveedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as SessionUser;

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    await prisma.vendor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}
