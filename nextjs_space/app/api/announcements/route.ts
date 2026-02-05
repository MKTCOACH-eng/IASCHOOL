export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId: user?.schoolId,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
        reads: {
          select: { userId: true, readAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    // Get total parents for admin stats
    const totalParents = await prisma.user.count({
      where: {
        schoolId: user?.schoolId,
        role: "PADRE",
      },
    });

    const isAdmin = user?.role === "ADMIN";

    const formattedAnnouncements = (announcements ?? [])?.map((a) => ({
      id: a?.id,
      title: a?.title,
      content: a?.content,
      priority: a?.priority,
      createdAt: a?.createdAt?.toISOString(),
      createdBy: a?.createdBy,
      ...(isAdmin
        ? {
            readCount: a?.reads?.length ?? 0,
            totalParents,
          }
        : {
            isRead: (a?.reads ?? [])?.some((r) => r?.userId === user?.id),
          }),
    }));

    // Calculate unread count for parents
    let unreadCount = 0;
    if (!isAdmin) {
      unreadCount = (formattedAnnouncements ?? [])?.filter((a: any) => !a?.isRead)?.length ?? 0;
    }

    return NextResponse.json({
      announcements: formattedAnnouncements,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Error al obtener anuncios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { title, content, priority } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título y contenido son requeridos" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority ?? "NORMAL",
        schoolId: user?.schoolId,
        createdById: user?.id,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Error al crear anuncio" }, { status: 500 });
  }
}
