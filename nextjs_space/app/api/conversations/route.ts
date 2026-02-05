import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Listar conversaciones del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const conversations = await db.conversation.findMany({
      where: {
        schoolId: user.schoolId,
        isActive: true,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { name: true },
            },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Formatear las conversaciones
    const formattedConversations = conversations.map((conv) => {
      const otherParticipants = conv.participants
        .filter((p) => p.userId !== user.id)
        .map((p) => p.user);

      const myParticipation = conv.participants.find((p) => p.userId === user.id);
      const lastMessage = conv.messages[0];

      // Contar mensajes no leídos
      const unreadCount = myParticipation?.lastReadAt
        ? 0 // TODO: Calcular real con query separada
        : conv.messages.length > 0
        ? 1
        : 0;

      return {
        id: conv.id,
        type: conv.type,
        name:
          conv.name ||
          (conv.type === "DIRECT"
            ? otherParticipants[0]?.name || "Conversación"
            : conv.group?.name || "Grupo"),
        participants: otherParticipants,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderName: lastMessage.sender.name,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
        isMuted: myParticipation?.isMuted || false,
        groupId: conv.groupId,
        groupName: conv.group?.name,
        createdAt: conv.createdAt,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva conversación
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const { type, participantIds, name, groupId } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Tipo de conversación requerido" },
        { status: 400 }
      );
    }

    // Para chat directo, verificar si ya existe
    if (type === "DIRECT" && participantIds?.length === 1) {
      const existingConversation = await db.conversation.findFirst({
        where: {
          type: "DIRECT",
          schoolId: user.schoolId,
          AND: [
            { participants: { some: { userId: user.id } } },
            { participants: { some: { userId: participantIds[0] } } },
          ],
        },
      });

      if (existingConversation) {
        return NextResponse.json(existingConversation);
      }
    }

    // Crear la conversación
    const conversation = await db.conversation.create({
      data: {
        type,
        name: name || null,
        schoolId: user.schoolId,
        groupId: groupId || null,
        participants: {
          create: [
            { userId: user.id },
            ...(participantIds || []).map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Error al crear conversación" },
      { status: 500 }
    );
  }
}
