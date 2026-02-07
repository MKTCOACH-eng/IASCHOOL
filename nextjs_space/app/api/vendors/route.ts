import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const whereClause: any = { schoolId: user.schoolId };
    
    // PROVEEDOR solo ve el suyo
    if (user.role === 'PROVEEDOR') {
      whereClause.ownerId = user.id;
    }
    
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true } },
        _count: { select: { products: true, orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 });
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const {
      name,
      description,
      type,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      zipCode,
      rfc,
      businessName,
      commissionRate
    } = body;

    if (!name || !type || !contactName || !contactEmail) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const vendor = await prisma.vendor.create({
      data: {
        schoolId: user.schoolId!,
        name,
        description,
        type,
        contactName,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        zipCode,
        rfc,
        businessName,
        commissionRate: commissionRate || 0,
        ownerId: user.id,
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
      },
      include: {
        owner: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}
