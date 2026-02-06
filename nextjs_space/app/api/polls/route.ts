import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Listar encuestas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    let groupIds: string[] = [];

    if (user.role === "PADRE" || user.role === "VOCAL") {
      // Padres ven encuestas de grupos de sus hijos
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { groupId: true },
      });
      groupIds = children.map((c) => c.groupId).filter(Boolean) as string[];
    } else if (user.role === "PROFESOR") {
      const groups = await db.group.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      groupIds = groups.map((g) => g.id);
    } else if (user.role === "ADMIN") {
      const groups = await db.group.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true },
      });
      groupIds = groups.map((g) => g.id);
    }

    if (groupId && groupIds.includes(groupId)) {
      groupIds = [groupId];
    }

    const polls = await db.poll.findMany({
      where: {
        groupId: { in: groupIds },
      },
      include: {
        group: { select: { name: true } },
        createdBy: { select: { name: true } },
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: {
              where: { userId: user.id },
              select: { id: true },
            },
          },
        },
        _count: { select: { options: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formatear respuesta
    const formattedPolls = polls.map((poll) => ({
      ...poll,
      options: poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt._count.votes,
        hasVoted: opt.votes.length > 0,
      })),
      totalVotes: poll.options.reduce((sum, opt) => sum + opt._count.votes, 0),
    }));

    return NextResponse.json(formattedPolls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST - Crear encuesta (solo vocal del grupo)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    const body = await request.json();
    const { groupId, title, description, options, allowMultiple, isAnonymous, endsAt } = body;

    if (!groupId || !title?.trim() || !options?.length || options.length < 2) {
      return NextResponse.json(
        { error: "Se requiere groupId, title y al menos 2 opciones" },
        { status: 400 }
      );
    }

    // Verificar que el usuario es vocal del grupo o admin
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { vocalId: user.id },
          { schoolId: user.schoolId, ...(user.role === "ADMIN" ? {} : { id: "none" }) },
        ],
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "No tienes permisos para crear encuestas en este grupo" },
        { status: 403 }
      );
    }

    const poll = await db.poll.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        groupId,
        createdById: user.id,
        allowMultiple: allowMultiple || false,
        isAnonymous: isAnonymous || false,
        endsAt: endsAt ? new Date(endsAt) : null,
        options: {
          create: options.map((text: string) => ({ text: text.trim() })),
        },
      },
      include: {
        options: true,
        group: { select: { name: true } },
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json({ error: "Error al crear encuesta" }, { status: 500 });
  }
}
