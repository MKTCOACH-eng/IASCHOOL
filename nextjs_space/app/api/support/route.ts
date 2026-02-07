import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
  subRole?: string;
}

// Generar número de ticket
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.supportTicket.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  });
  return `TICKET-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET - Listar tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const isPlatformLevel = searchParams.get('isPlatformLevel') === 'true';

    const whereClause: any = {};

    // SUPER_ADMIN ve todos los tickets de plataforma
    if (user.role === 'SUPER_ADMIN') {
      whereClause.isPlatformLevel = true;
    }
    // ADMIN con subrol SISTEMAS ve tickets internos del colegio
    else if (user.role === 'ADMIN' && user.subRole === 'SISTEMAS') {
      whereClause.schoolId = user.schoolId;
      whereClause.isInternal = true;
    }
    // ADMIN ve todos los tickets del colegio
    else if (user.role === 'ADMIN') {
      whereClause.schoolId = user.schoolId;
    }
    // Otros usuarios ven solo sus tickets
    else {
      whereClause.createdById = user.id;
    }

    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
        _count: { select: { messages: true } }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Estadísticas
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      avgResponseTime: 0 // Calcular si es necesario
    };

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Error al obtener tickets' }, { status: 500 });
  }
}

// POST - Crear ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      category,
      priority,
      subject,
      description,
      attachments,
      isInternal,
      isPlatformLevel,
      guestEmail,
      guestName
    } = body;

    if (!category || !subject || !description) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const ticketNumber = await generateTicketNumber();
    const user = session?.user as SessionUser | undefined;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        schoolId: user?.schoolId || null,
        createdById: user?.id || null,
        guestEmail: !user ? guestEmail : null,
        guestName: !user ? guestName : null,
        category,
        priority: priority || 'MEDIUM',
        subject,
        description,
        attachments: attachments || [],
        isInternal: isInternal || false,
        isPlatformLevel: isPlatformLevel || false,
        status: 'OPEN'
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Error al crear ticket' }, { status: 500 });
  }
}
