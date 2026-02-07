import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
}

// GET - Obtener cotización específica
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
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        selectedPlan: true,
        createdBy: { select: { id: true, name: true, email: true } },
        negotiations: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Error al obtener cotización' }, { status: 500 });
  }
}

// PUT - Actualizar cotización
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
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, internalNotes, ...updateData } = body;

    // Convertir números
    if (updateData.estimatedStudents) updateData.estimatedStudents = parseInt(updateData.estimatedStudents);
    if (updateData.setupFee) updateData.setupFee = parseFloat(updateData.setupFee);
    if (updateData.monthlyTotal) updateData.monthlyTotal = parseFloat(updateData.monthlyTotal);
    if (updateData.annualTotal) updateData.annualTotal = parseFloat(updateData.annualTotal);
    if (updateData.iaSchoolMonthly) updateData.iaSchoolMonthly = parseFloat(updateData.iaSchoolMonthly);
    if (updateData.schoolMonthly) updateData.schoolMonthly = parseFloat(updateData.schoolMonthly);
    if (updateData.setupFeeDiscount) updateData.setupFeeDiscount = parseFloat(updateData.setupFeeDiscount);
    if (updateData.customPricePerStudent) updateData.customPricePerStudent = parseFloat(updateData.customPricePerStudent);

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...updateData,
        status,
        notes,
        internalNotes,
        ...(status === 'SENT' && { sentAt: new Date() }),
        ...(status === 'VIEWED' && { viewedAt: new Date() }),
        ...(status === 'ACCEPTED' || status === 'REJECTED' ? { respondedAt: new Date() } : {})
      },
      include: {
        selectedPlan: true,
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Registrar negociación
    await prisma.quoteNegotiation.create({
      data: {
        quoteId: id,
        action: status ? `status_changed_to_${status.toLowerCase()}` : 'updated',
        notes: notes || 'Cotización actualizada',
        proposedChanges: updateData,
        createdById: user.id
      }
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 });
  }
}

// DELETE - Eliminar cotización
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
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.quote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Error al eliminar cotización' }, { status: 500 });
  }
}
