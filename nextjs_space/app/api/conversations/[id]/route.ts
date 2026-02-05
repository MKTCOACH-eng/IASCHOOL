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

// GET - Obtener detalles de una conversación
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

    const conversation = await db.conversation.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        participants: {
          some: { userId: user.id },
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
                email: true,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar lastReadAt
    await db.conversationParticipant.updateMany({
      where: {
        conversationId: id,
        userId: user.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Error al obtener conversación" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar conversación (silenciar, etc)
export async function PATCH(
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
    const { isMuted } = body;

    // Verificar participación
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "No eres parte de esta conversación" },
        { status: 403 }
      );
    }

    await db.conversationParticipant.update({
      where: { id: participant.id },
      data: { isMuted },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Error al actualizar conversación" },
      { status: 500 }
    );
  }
}
