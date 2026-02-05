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

// GET - Obtener mensajes anclados de una conversación
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
    const conversationId = params.id;

    // Verificar que el usuario es parte de la conversación
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "No autorizado para ver esta conversación" },
        { status: 403 }
      );
    }

    const pinnedMessages = await db.message.findMany({
      where: {
        conversationId,
        isPinned: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        pinnedAt: "desc",
      },
    });

    return NextResponse.json(pinnedMessages);
  } catch (error) {
    console.error("Error fetching pinned messages:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes anclados" },
      { status: 500 }
    );
  }
}
