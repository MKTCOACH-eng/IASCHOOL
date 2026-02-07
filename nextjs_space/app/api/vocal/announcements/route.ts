import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Listar avisos del grupo
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    // Obtener grupos accesibles para el usuario
    let groupIds: string[] = [];

    if (groupId) {
      groupIds = [groupId];
    } else {
      if (user.role === "VOCAL" || user.role === "PADRE") {
        const vocalGroups = await prisma.groupVocal.findMany({
          where: { userId: user.id, isActive: true },
          select: { groupId: true }
        });

        const parentGroups = await prisma.student.findMany({
          where: {
            parents: { some: { id: user.id } },
            groupId: { not: null }
          },
          select: { groupId: true }
        });

        groupIds = [
          ...vocalGroups.map(g => g.groupId),
          ...parentGroups.map(g => g.groupId!)
        ];
        groupIds = [...new Set(groupIds)];
      } else if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        const allGroups = await prisma.group.findMany({
          where: { schoolId: user.schoolId, isActive: true },
          select: { id: true }
        });
        groupIds = allGroups.map(g => g.id);
      } else if (user.role === "PROFESOR") {
        const teacherGroups = await prisma.group.findMany({
          where: { teacherId: user.id, isActive: true },
          select: { id: true }
        });
        groupIds = teacherGroups.map(g => g.id);
      }
    }

    const announcements = await prisma.groupAnnouncement.findMany({
      where: {
        groupId: { in: groupIds },
        isActive: true
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        linkedFund: { select: { id: true, title: true, status: true } },
        reads: {
          where: { userId: user.id },
          select: { readAt: true }
        }
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ]
    });

    // Agregar flag de leído
    const announcementsWithRead = announcements.map(a => ({
      ...a,
      isRead: a.reads.length > 0,
      reads: undefined
    }));

    return NextResponse.json(announcementsWithRead);
  } catch (error) {
    console.error("Error fetching group announcements:", error);
    return NextResponse.json({ error: "Error al obtener avisos" }, { status: 500 });
  }
}

// POST - Crear aviso (solo vocales)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Verificar que sea vocal o admin
    if (!["VOCAL", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo vocales pueden crear avisos" }, { status: 403 });
    }

    const body = await req.json();
    const { groupId, title, content, attachmentUrl, attachmentName, linkedFundId, isPinned } = body;

    if (!groupId || !title || !content) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que sea vocal del grupo (si no es admin)
    if (user.role === "VOCAL") {
      const isVocal = await prisma.groupVocal.findFirst({
        where: { groupId, userId: user.id, isActive: true }
      });
      if (!isVocal) {
        return NextResponse.json({ error: "No eres vocal de este grupo" }, { status: 403 });
      }
    }

    const announcement = await prisma.groupAnnouncement.create({
      data: {
        groupId,
        createdById: user.id,
        title,
        content,
        attachmentUrl,
        attachmentName,
        linkedFundId,
        isPinned: isPinned || false
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        linkedFund: { select: { id: true, title: true, status: true } }
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating group announcement:", error);
    return NextResponse.json({ error: "Error al crear aviso" }, { status: 500 });
  }
}
