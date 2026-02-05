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

// GET - Listar mensajes de una conversación
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verificar que el usuario es parte de la conversación
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "No autorizado para ver esta conversación" },
        { status: 403 }
      );
    }

    const messages = await db.message.findMany({
      where: {
        conversationId: id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    // Actualizar lastReadAt
    await db.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;
    const body = await request.json();
    const { content, type = "TEXT", fileUrl, fileName, fileSize, mimeType } = body;

    if (!content?.trim() && type === "TEXT") {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    if ((type === "FILE" || type === "IMAGE") && !fileUrl) {
      return NextResponse.json(
        { error: "URL de archivo requerida" },
        { status: 400 }
      );
    }

    // Verificar que el usuario es parte de la conversación
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "No autorizado para enviar mensajes" },
        { status: 403 }
      );
    }

    // Crear mensaje y actualizar lastMessageAt
    const [message] = await db.$transaction([
      db.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          type,
          content: content?.trim() || "",
          fileUrl,
          fileName,
          fileSize,
          mimeType,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      db.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
