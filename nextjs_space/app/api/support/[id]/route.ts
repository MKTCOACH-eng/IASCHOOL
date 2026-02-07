import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener ticket por ID con mensajes
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        school: { select: { id: true, name: true } },
        messages: {
          include: {
            author: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    // Verificar acceso
    const canAccess = 
      user.role === 'SUPER_ADMIN' ||
      (user.role === 'ADMIN' && ticket.schoolId === user.schoolId) ||
      ticket.createdById === user.id ||
      ticket.assignedToId === user.id;

    if (!canAccess) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    // Filtrar mensajes internos si no es admin/asignado
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && ticket.assignedToId !== user.id) {
      ticket.messages = ticket.messages.filter(m => !m.isInternal);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Error al obtener ticket' }, { status: 500 });
  }
}

// PUT - Actualizar ticket
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

    // Solo ADMIN puede actualizar ciertos campos
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const updateData: any = {};
    const { status, priority, assignedToId, satisfactionRating, satisfactionFeedback } = body;

    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (satisfactionRating) updateData.satisfactionRating = satisfactionRating;
    if (satisfactionFeedback) updateData.satisfactionFeedback = satisfactionFeedback;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Error al actualizar ticket' }, { status: 500 });
  }
}

// POST - Agregar mensaje al ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: ticketId } = await params;
    const user = session.user as SessionUser;
    const body = await request.json();
    const { content, attachments, isInternal } = body;

    if (!content) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 });
    }

    // Verificar acceso al ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    const message = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        authorId: user.id,
        content,
        attachments: attachments || [],
        isInternal: isInternal || false,
        isFromAI: false
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    // Actualizar estado si es primera respuesta
    if (!ticket.firstResponseAt && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          firstResponseAt: new Date(),
          status: 'IN_PROGRESS'
        }
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Error al crear mensaje' }, { status: 500 });
  }
}
