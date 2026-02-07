import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// GET - Obtener equipos del alumno
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Solo alumnos pueden ver equipos
    if (user.role !== "ALUMNO") {
      return NextResponse.json({ error: "Solo para alumnos" }, { status: 403 });
    }

    // Obtener conversaciones de tipo TEAM donde el alumno participa
    const teams = await db.conversation.findMany({
      where: {
        type: "TEAM",
        participants: {
          some: { userId: user.id }
        },
        isActive: true
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true }
        }
      },
      orderBy: { lastMessageAt: "desc" }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear nuevo equipo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user.role !== "ALUMNO") {
      return NextResponse.json({ error: "Solo alumnos pueden crear equipos" }, { status: 403 });
    }

    const { name, memberIds } = await req.json();

    if (!name || !memberIds || memberIds.length === 0) {
      return NextResponse.json({ error: "Nombre y miembros requeridos" }, { status: 400 });
    }

    // Verificar que todos los miembros son alumnos de la misma escuela
    const members = await db.user.findMany({
      where: {
        id: { in: memberIds },
        role: "ALUMNO",
        schoolId: user.schoolId
      }
    });

    if (members.length !== memberIds.length) {
      return NextResponse.json({ error: "Algunos miembros no son válidos" }, { status: 400 });
    }

    // Crear el equipo (conversación tipo TEAM)
    const team = await db.conversation.create({
      data: {
        type: "TEAM",
        name,
        schoolId: user.schoolId,
        participants: {
          create: [
            { userId: user.id }, // Creador
            ...memberIds.filter((id: string) => id !== user.id).map((id: string) => ({ userId: id }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Abandonar equipo
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("id");

    if (!teamId) {
      return NextResponse.json({ error: "ID de equipo requerido" }, { status: 400 });
    }

    // Eliminar participación del usuario
    await db.conversationParticipant.deleteMany({
      where: {
        conversationId: teamId,
        userId: user.id
      }
    });

    // Verificar si quedan participantes
    const remainingParticipants = await db.conversationParticipant.count({
      where: { conversationId: teamId }
    });

    // Si no quedan participantes, desactivar el equipo
    if (remainingParticipants === 0) {
      await db.conversation.update({
        where: { id: teamId },
        data: { isActive: false }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
