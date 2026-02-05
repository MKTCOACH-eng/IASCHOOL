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

// POST - Anclar/desanclar un mensaje
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
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mensaje no encontrado" },
        { status: 404 }
      );
    }

    // Solo admins, profesores o el autor del mensaje pueden anclar
    const canPin =
      user.role === "ADMIN" ||
      user.role === "PROFESOR" ||
      message.senderId === user.id;

    if (!canPin) {
      return NextResponse.json(
        { error: "No tienes permisos para anclar mensajes" },
        { status: 403 }
      );
    }

    // Toggle pin status
    const newPinStatus = !message.isPinned;

    await db.message.update({
      where: { id: messageId },
      data: {
        isPinned: newPinStatus,
        pinnedAt: newPinStatus ? new Date() : null,
        pinnedById: newPinStatus ? user.id : null,
      },
    });

    return NextResponse.json({
      isPinned: newPinStatus,
      message: newPinStatus ? "Mensaje anclado" : "Mensaje desanclado",
    });
  } catch (error) {
    console.error("Error toggling pin:", error);
    return NextResponse.json(
      { error: "Error al anclar/desanclar mensaje" },
      { status: 500 }
    );
  }
}
