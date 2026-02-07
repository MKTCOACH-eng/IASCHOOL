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

// GET - Marcar como leído
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const announcementId = params.id;

    // Marcar como leído
    await prisma.groupAnnouncementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId: user.id
        }
      },
      update: { readAt: new Date() },
      create: {
        announcementId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PUT - Actualizar aviso
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const announcementId = params.id;

    const announcement = await prisma.groupAnnouncement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
    }

    // Verificar permiso
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: announcement.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, attachmentUrl, attachmentName, linkedFundId, isPinned } = body;

    const updated = await prisma.groupAnnouncement.update({
      where: { id: announcementId },
      data: {
        title: title || undefined,
        content: content || undefined,
        attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : undefined,
        attachmentName: attachmentName !== undefined ? attachmentName : undefined,
        linkedFundId: linkedFundId !== undefined ? linkedFundId : undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        linkedFund: { select: { id: true, title: true, status: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE - Eliminar aviso
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const announcementId = params.id;

    const announcement = await prisma.groupAnnouncement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
    }

    // Verificar permiso
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: announcement.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    await prisma.groupAnnouncement.update({
      where: { id: announcementId },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
