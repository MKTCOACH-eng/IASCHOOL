import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const schoolId = user.schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: "Escuela no encontrada" }, { status: 400 });
    }

    // Get user's children's groups for filtering
    let userGroupIds: string[] = [];
    if (user.role === 'PADRE') {
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { groupId: true }
      });
      userGroupIds = children.map((c: { groupId: string | null }) => c.groupId).filter((id): id is string => id !== null);
    }

    // Build visibility filter
    const where: any = {
      schoolId,
      isActive: true,
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'PRIVATE', createdById: user.role === 'ADMIN' ? user.id : undefined }
      ]
    };

    // Add GROUP_ONLY filter if user is a parent
    if (user.role === 'PADRE' && userGroupIds.length > 0) {
      where.OR.push({ visibility: 'GROUP_ONLY', groupId: { in: userGroupIds } });
    }

    // Admins can see all
    if (user.role === 'ADMIN') {
      delete where.OR;
    }

    const albums = await db.photoAlbum.findMany({
      where,
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        _count: { select: { photos: true } }
      },
      orderBy: { eventDate: 'desc' }
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { title, description, groupId, visibility, eventDate, coverUrl } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    }

    const album = await db.photoAlbum.create({
      data: {
        schoolId: user.schoolId,
        title,
        description,
        groupId: groupId || null,
        visibility: visibility || 'PUBLIC',
        eventDate: eventDate ? new Date(eventDate) : null,
        coverUrl,
        createdById: user.id
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await db.photoAlbum.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
