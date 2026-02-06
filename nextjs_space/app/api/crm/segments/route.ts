import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
}

interface SegmentFilters {
  roles?: string[];
  groupIds?: string[];
  hasUnpaidCharges?: boolean;
  hasChildren?: boolean;
  createdAfter?: string;
}

// GET - Listar segmentos de la escuela
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const segments = await prisma.crmSegment.findMany({
      where: { 
        schoolId: user.schoolId!,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { campaigns: true }
        }
      }
    });

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nuevo segmento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { name, description, filters } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Calcular el número de usuarios que coinciden con los filtros
    const userCount = await calculateSegmentUserCount(user.schoolId!, filters as SegmentFilters);

    const segment = await prisma.crmSegment.create({
      data: {
        schoolId: user.schoolId!,
        name,
        description,
        filters: filters || {},
        userCount
      }
    });

    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar segmento
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de segmento requerido' }, { status: 400 });
    }

    // Verificar que el segmento pertenece a la escuela
    const segment = await prisma.crmSegment.findFirst({
      where: { id, schoolId: user.schoolId! }
    });

    if (!segment) {
      return NextResponse.json({ error: 'Segmento no encontrado' }, { status: 404 });
    }

    // Soft delete
    await prisma.crmSegment.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting segment:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Función auxiliar para calcular usuarios en un segmento
async function calculateSegmentUserCount(schoolId: string, filters: SegmentFilters): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    schoolId,
  };

  if (filters?.roles && filters.roles.length > 0) {
    whereClause.role = { in: filters.roles };
  }

  if (filters?.hasChildren) {
    whereClause.children = { some: {} };
  }

  if (filters?.hasUnpaidCharges) {
    // Buscar padres con hijos que tengan cargos pendientes
    const parentsWithUnpaidCharges = await prisma.user.findMany({
      where: {
        schoolId,
        role: 'PADRE',
        children: {
          some: {
            charges: {
              some: {
                status: { in: ['PENDIENTE', 'VENCIDO'] }
              }
            }
          }
        }
      },
      select: { id: true }
    });
    
    if (whereClause.id) {
      whereClause.id = { in: parentsWithUnpaidCharges.map((p: { id: string }) => p.id) };
    } else {
      whereClause.id = { in: parentsWithUnpaidCharges.map((p: { id: string }) => p.id) };
    }
  }

  if (filters?.groupIds && filters.groupIds.length > 0) {
    // Usuarios con hijos en grupos específicos
    whereClause.children = {
      some: {
        groupId: { in: filters.groupIds }
      }
    };
  }

  if (filters?.createdAfter) {
    whereClause.createdAt = { gte: new Date(filters.createdAfter) };
  }

  const count = await prisma.user.count({ where: whereClause });
  return count;
}
