import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener un tip específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tip = await prisma.educationalTip.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });

    if (!tip) {
      return NextResponse.json({ error: 'Tip no encontrado' }, { status: 404 });
    }

    // Incrementar contador de vistas
    await prisma.educationalTip.update({
      where: { id: tip.id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error fetching tip:', error);
    return NextResponse.json({ error: 'Error al obtener tip' }, { status: 500 });
  }
}

// PUT - Actualizar/aprobar tip
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      summary,
      category,
      ageRange,
      tags,
      featuredImageUrl,
      status,
      reviewNotes,
      rejectionReason
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (summary) updateData.summary = summary;
    if (category) updateData.category = category;
    if (ageRange) updateData.ageRange = ageRange;
    if (tags) updateData.tags = tags;
    if (featuredImageUrl !== undefined) updateData.featuredImageUrl = featuredImageUrl;
    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    // Manejar cambios de estado
    if (status) {
      updateData.status = status;
      
      if (status === 'APPROVED' || status === 'PUBLISHED') {
        updateData.reviewedById = user.id;
        updateData.reviewedAt = new Date();
      }
      
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
      
      if (status === 'REJECTED') {
        updateData.reviewedById = user.id;
        updateData.reviewedAt = new Date();
      }
    }

    const tip = await prisma.educationalTip.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error updating tip:', error);
    return NextResponse.json({ error: 'Error al actualizar tip' }, { status: 500 });
  }
}

// DELETE - Eliminar tip
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.educationalTip.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json({ error: 'Error al eliminar tip' }, { status: 500 });
  }
}
