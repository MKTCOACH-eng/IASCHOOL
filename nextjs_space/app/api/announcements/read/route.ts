export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { announcementId } = await request.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: "ID de anuncio requerido" },
        { status: 400 }
      );
    }

    // Check if already read
    const existingRead = await prisma.announcementRead.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId: user?.id,
        },
      },
    });

    if (existingRead) {
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    await prisma.announcementRead.create({
      data: {
        announcementId,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: "Error al marcar como leído" },
      { status: 500 }
    );
  }
}
