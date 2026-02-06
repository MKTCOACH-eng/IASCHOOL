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

// GET - Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Obtener una conversación específica con sus mensajes
      const conversation = await prisma.chatbotConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
      }

      return NextResponse.json(conversation);
    }

    // Listar conversaciones del usuario
    const conversations = await prisma.chatbotConversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching chatbot conversations:', error);
    return NextResponse.json(
      { error: 'Error al obtener conversaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const conversation = await prisma.chatbotConversation.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId
      }
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating chatbot conversation:', error);
    return NextResponse.json(
      { error: 'Error al crear conversación' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar conversación (resolver, calificar)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const { conversationId, resolved, rating } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversación requerido' }, { status: 400 });
    }

    const conversation = await prisma.chatbotConversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    const updateData: { resolved?: boolean; rating?: number } = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (rating !== undefined && rating >= 1 && rating <= 5) updateData.rating = rating;

    const updated = await prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating chatbot conversation:', error);
    return NextResponse.json(
      { error: 'Error al actualizar conversación' },
      { status: 500 }
    );
  }
}
