import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// POST - Votar en una encuesta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id: pollId } = await params;
    const body = await request.json();
    const { optionIds } = body; // Array de IDs de opciones

    if (!optionIds?.length) {
      return NextResponse.json({ error: "Se requiere al menos una opción" }, { status: 400 });
    }

    // Obtener la encuesta
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        group: true,
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }

    // Verificar que la encuesta está activa
    if (poll.status !== "ACTIVE") {
      return NextResponse.json({ error: "Esta encuesta ya está cerrada" }, { status: 400 });
    }

    // Verificar si expiró
    if (poll.endsAt && new Date() > poll.endsAt) {
      return NextResponse.json({ error: "Esta encuesta ha expirado" }, { status: 400 });
    }

    // Verificar acceso al grupo (padre con hijo en el grupo)
    if (user.role === "PADRE" || user.role === "VOCAL") {
      const hasAccess = await db.student.findFirst({
        where: {
          groupId: poll.groupId,
          parents: { some: { id: user.id } },
        },
      });
      if (!hasAccess) {
        return NextResponse.json({ error: "No tienes acceso a esta encuesta" }, { status: 403 });
      }
    }

    // Verificar que no permite múltiples y solo se envía una
    if (!poll.allowMultiple && optionIds.length > 1) {
      return NextResponse.json(
        { error: "Esta encuesta solo permite una opción" },
        { status: 400 }
      );
    }

    // Verificar que las opciones existen
    const validOptionIds = poll.options.map((o) => o.id);
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return NextResponse.json({ error: "Opciones inválidas" }, { status: 400 });
    }

    // Eliminar votos anteriores del usuario en esta encuesta
    await db.pollVote.deleteMany({
      where: {
        userId: user.id,
        option: { pollId },
      },
    });

    // Crear nuevos votos
    await db.pollVote.createMany({
      data: optionIds.map((optionId: string) => ({
        optionId,
        userId: user.id,
      })),
    });

    return NextResponse.json({ success: true, votedOptions: optionIds });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}
