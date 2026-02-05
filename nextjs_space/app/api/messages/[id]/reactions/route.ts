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

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// POST - Agregar/quitar reacción a un mensaje
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const messageId = params.id;
    const body = await request.json();
    const { emoji } = body;

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: "Emoji no válido" },
        { status: 400 }
      );
    }

    // Verificar que el mensaje existe y el usuario tiene acceso
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: { userId: user.id },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mensaje no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe la reacción
    const existingReaction = await db.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Quitar la reacción (toggle)
      await db.messageReaction.delete({
        where: { id: existingReaction.id },
      });

      return NextResponse.json({ action: "removed", emoji });
    } else {
      // Agregar la reacción
      await db.messageReaction.create({
        data: {
          messageId,
          userId: user.id,
          emoji,
        },
      });

      return NextResponse.json({ action: "added", emoji });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Error al procesar reacción" },
      { status: 500 }
    );
  }
}

// GET - Obtener reacciones de un mensaje
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const messageId = params.id;

    // Verificar acceso al mensaje
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: { userId: user.id },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mensaje no encontrado" },
        { status: 404 }
      );
    }

    const reactions = await db.messageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Agrupar por emoji
    const grouped = reactions.reduce(
      (acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push({
          userId: reaction.user.id,
          userName: reaction.user.name,
        });
        return acc;
      },
      {} as Record<string, Array<{ userId: string; userName: string }>>
    );

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Error al obtener reacciones" },
      { status: 500 }
    );
  }
}
