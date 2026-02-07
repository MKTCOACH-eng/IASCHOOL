import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Listar productos del proveedor
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
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');

    const whereClause: any = { vendorId };
    if (categoryId) whereClause.categoryId = categoryId;
    if (isActive !== null) whereClause.isActive = isActive === 'true';

    const products = await prisma.vendorProduct.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

// POST - Crear producto
export async function POST(
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

    // Verificar que es dueño del vendor o ADMIN
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, schoolId: user.schoolId }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && vendor.ownerId !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const {
      name,
      description,
      sku,
      imageUrl,
      images,
      price,
      compareAtPrice,
      cost,
      categoryId,
      trackInventory,
      stock,
      lowStockAlert,
      hasVariants,
      variants,
      weight,
      dimensions,
      mealType,
      dayOfWeek
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }

    const product = await prisma.vendorProduct.create({
      data: {
        vendorId,
        name,
        description,
        sku,
        imageUrl,
        images: images || [],
        price,
        compareAtPrice,
        cost,
        categoryId,
        trackInventory: trackInventory ?? true,
        stock: stock || 0,
        lowStockAlert: lowStockAlert || 5,
        hasVariants: hasVariants || false,
        variants,
        weight,
        dimensions,
        mealType,
        dayOfWeek,
        isActive: true
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
