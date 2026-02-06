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

// GET - Listar plantillas de email
export async function GET(request: Request) {
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
    const category = searchParams.get('category');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { schoolId: user.schoolId };
    if (category) {
      whereClause.category = category;
    }

    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva plantilla
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

    const { name, subject, content, category, isDefault } = await request.json();

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Nombre, asunto y contenido son requeridos' }, { status: 400 });
    }

    // Si es plantilla por defecto, quitar el flag de las demás de la misma categoría
    if (isDefault && category) {
      await prisma.emailTemplate.updateMany({
        where: { schoolId: user.schoolId!, category, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        schoolId: user.schoolId!,
        name,
        subject,
        content,
        category,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar plantilla
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id, name, subject, content, category, isDefault } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 });
    }

    // Verificar que la plantilla pertenece a la escuela
    const existing = await prisma.emailTemplate.findFirst({
      where: { id, schoolId: user.schoolId! }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }

    // Si es plantilla por defecto, quitar el flag de las demás de la misma categoría
    if (isDefault && category) {
      await prisma.emailTemplate.updateMany({
        where: { schoolId: user.schoolId!, category, isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: name || existing.name,
        subject: subject || existing.subject,
        content: content || existing.content,
        category: category !== undefined ? category : existing.category,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault
      }
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar plantilla
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
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 });
    }

    // Verificar que la plantilla pertenece a la escuela
    const template = await prisma.emailTemplate.findFirst({
      where: { id, schoolId: user.schoolId! }
    });

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }

    await prisma.emailTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
