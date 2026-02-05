export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const announcementId = params?.id;

    // Verify announcement belongs to user's school
    const announcement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        schoolId: user?.schoolId,
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}
