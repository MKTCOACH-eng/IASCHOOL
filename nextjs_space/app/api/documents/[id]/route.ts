import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Obtener documento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        schoolId: user.schoolId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        },
        signatures: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { signedAt: 'desc' }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar acceso para usuarios no-admin
    if (user.role !== 'ADMIN' && document.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'No tienes acceso a este documento' },
        { status: 403 }
      );
    }

    // Información adicional
    const userSigned = document.signatures.some((sig: { userId: string }) => sig.userId === user.id);
    const userSignature = document.signatures.find((sig: { userId: string }) => sig.userId === user.id);

    return NextResponse.json({
      ...document,
      userSigned,
      userSignature,
      signatureCount: document.signatures.length
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Error al obtener documento' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar documento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden editar documentos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, content, type, targetRole, groupId, expiresAt, status } = body;

    const existingDoc = await prisma.document.findFirst({
      where: { id, schoolId: user.schoolId },
      include: { _count: { select: { signatures: true } } }
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // No permitir editar contenido si ya hay firmas
    if (existingDoc._count.signatures > 0 && (content || title)) {
      return NextResponse.json(
        { error: 'No se puede editar un documento que ya tiene firmas' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (groupId !== undefined) updateData.groupId = groupId;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (status !== undefined) updateData.status = status;

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Error al actualizar documento' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar documentos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingDoc = await prisma.document.findFirst({
      where: { id, schoolId: user.schoolId },
      include: { _count: { select: { signatures: true } } }
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar si ya hay firmas
    if (existingDoc._count.signatures > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un documento que ya tiene firmas. Puedes cancelarlo.' },
        { status: 400 }
      );
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: 'Documento eliminado' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    );
  }
}
