import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { sendCampaignEmail } from '@/lib/send-notification';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
}

// GET - Listar campañas
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
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { schoolId: user.schoolId };
    if (status) {
      whereClause.status = status;
    }

    const campaigns = await prisma.crmCampaign.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        segment: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { recipients: true } }
      }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva campaña
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

    const { name, subject, content, segmentId, type, scheduledAt, sendNow } = await request.json();

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Nombre, asunto y contenido son requeridos' }, { status: 400 });
    }

    // Obtener usuarios del segmento o todos los usuarios de la escuela
    let users;
    if (segmentId) {
      const segment = await prisma.crmSegment.findUnique({
        where: { id: segmentId }
      });
      if (!segment) {
        return NextResponse.json({ error: 'Segmento no encontrado' }, { status: 404 });
      }
      // Obtener usuarios basados en los filtros del segmento
      users = await getUsersFromSegment(user.schoolId!, segment.filters as Record<string, unknown>);
    } else {
      // Todos los usuarios de la escuela con email
      users = await prisma.user.findMany({
        where: { 
          schoolId: user.schoolId,
          NOT: { email: '' }
        },
        select: { id: true, email: true, name: true }
      });
    }

    // Crear la campaña
    const campaign = await prisma.crmCampaign.create({
      data: {
        schoolId: user.schoolId!,
        name,
        subject,
        content,
        type: type || 'EMAIL',
        status: sendNow ? 'SENDING' : (scheduledAt ? 'SCHEDULED' : 'DRAFT'),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: user.id,
        segmentId,
        totalRecipients: users.length,
        recipients: {
          create: users.map((u: { id: string; email: string; name: string }) => ({
            userId: u.id,
            email: u.email
          }))
        }
      },
      include: {
        segment: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    // Si se debe enviar ahora, iniciar el proceso de envío
    if (sendNow) {
      // Enviar emails en segundo plano
      sendCampaignEmails(campaign.id, users, subject, content).catch(console.error);
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar campaña
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
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    // Verificar que la campaña pertenece a la escuela y no ha sido enviada
    const campaign = await prisma.crmCampaign.findFirst({
      where: { id, schoolId: user.schoolId! }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      return NextResponse.json({ error: 'No se puede eliminar una campaña enviada' }, { status: 400 });
    }

    // Eliminar la campaña y sus destinatarios
    await prisma.$transaction([
      prisma.crmCampaignRecipient.deleteMany({ where: { campaignId: id } }),
      prisma.crmCampaign.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Función auxiliar para obtener usuarios de un segmento
async function getUsersFromSegment(schoolId: string, filters: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = { schoolId, NOT: { email: '' } };

  if (filters?.roles && Array.isArray(filters.roles) && filters.roles.length > 0) {
    whereClause.role = { in: filters.roles };
  }

  if (filters?.groupIds && Array.isArray(filters.groupIds) && filters.groupIds.length > 0) {
    whereClause.children = {
      some: {
        groupId: { in: filters.groupIds }
      }
    };
  }

  return prisma.user.findMany({
    where: whereClause,
    select: { id: true, email: true, name: true }
  });
}

// Función para enviar emails de la campaña
async function sendCampaignEmails(
  campaignId: string,
  users: { id: string; email: string; name: string }[],
  subject: string,
  content: string
) {
  let deliveredCount = 0;

  for (const user of users) {
    try {
      await sendCampaignEmail(user.email, user.name, subject, content);
      
      // Actualizar estado del destinatario
      await prisma.crmCampaignRecipient.updateMany({
        where: { campaignId, userId: user.id },
        data: { status: 'sent', sentAt: new Date() }
      });
      
      deliveredCount++;
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error);
      await prisma.crmCampaignRecipient.updateMany({
        where: { campaignId, userId: user.id },
        data: { status: 'failed' }
      });
    }
  }

  // Actualizar la campaña
  await prisma.crmCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      deliveredCount
    }
  });
}
