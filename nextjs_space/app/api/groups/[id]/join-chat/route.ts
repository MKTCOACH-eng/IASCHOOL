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

// POST - Unirse o crear chat de padres del grupo
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
    const groupId = params.id;

    // Verificar que el grupo existe y pertenece al colegio
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        schoolId: user.schoolId,
        isActive: true,
      },
      include: {
        teacher: true,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario tiene acceso al grupo
    let hasAccess = false;

    if (user.role === "ADMIN") {
      hasAccess = true;
    } else if (user.role === "PROFESOR" && group.teacherId === user.id) {
      hasAccess = true;
    } else if (user.role === "PADRE") {
      // Verificar si tiene hijos en el grupo
      const childrenInGroup = await db.student.count({
        where: {
          groupId: groupId,
          parents: { some: { id: user.id } },
        },
      });
      hasAccess = childrenInGroup > 0;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No tienes acceso a este grupo" },
        { status: 403 }
      );
    }

    // Buscar chat existente del grupo
    let conversation = await db.conversation.findFirst({
      where: {
        groupId: groupId,
        type: "GROUP_PARENTS",
        isActive: true,
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (conversation) {
      // Verificar si el usuario ya es participante
      const isParticipant = conversation.participants.some(
        (p) => p.userId === user.id
      );

      if (!isParticipant) {
        // Agregar al usuario como participante
        await db.conversationParticipant.create({
          data: {
            conversationId: conversation.id,
            userId: user.id,
          },
        });

        // Crear mensaje de sistema
        await db.message.create({
          data: {
            conversationId: conversation.id,
            senderId: user.id,
            type: "SYSTEM",
            content: `${user.name} se unió al grupo`,
          },
        });

        // Actualizar lastMessageAt
        await db.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });
      }

      return NextResponse.json({
        conversationId: conversation.id,
        isNew: false,
      });
    }

    // Crear nuevo chat de grupo
    // Obtener todos los padres de alumnos del grupo
    const studentsWithParents = await db.student.findMany({
      where: {
        groupId: groupId,
        isActive: true,
      },
      include: {
        parents: {
          select: { id: true },
        },
      },
    });

    // Obtener IDs únicos de padres
    const parentIds = new Set<string>();
    studentsWithParents.forEach((student) => {
      student.parents.forEach((parent) => {
        parentIds.add(parent.id);
      });
    });

    // Añadir al profesor si existe
    const participantIds = Array.from(parentIds);
    if (group.teacherId) {
      participantIds.push(group.teacherId);
    }

    // Asegurar que el usuario actual está incluido
    if (!participantIds.includes(user.id)) {
      participantIds.push(user.id);
    }

    // Crear la conversación con todos los participantes
    conversation = await db.conversation.create({
      data: {
        type: "GROUP_PARENTS",
        name: `Padres - ${group.name}`,
        schoolId: user.schoolId,
        groupId: groupId,
        lastMessageAt: new Date(),
        participants: {
          create: participantIds.map((id) => ({ userId: id })),
        },
        messages: {
          create: {
            senderId: user.id,
            type: "SYSTEM",
            content: `Chat de padres de ${group.name} creado`,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      isNew: true,
      participantsCount: participantIds.length,
    });
  } catch (error) {
    console.error("Error joining group chat:", error);
    return NextResponse.json(
      { error: "Error al unirse al chat del grupo" },
      { status: 500 }
    );
  }
}
