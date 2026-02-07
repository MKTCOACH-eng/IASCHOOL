import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

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

    const { albumId, url, thumbnailUrl, caption, takenAt, width, height, fileSize } = await req.json();

    if (!albumId || !url) {
      return NextResponse.json({ error: "\u00c1lbum y URL requeridos" }, { status: 400 });
    }

    // Get last photo order in album
    const lastPhoto = await db.photo.findFirst({
      where: { albumId },
      orderBy: { order: 'desc' }
    });

    const photo = await db.photo.create({
      data: {
        albumId,
        url,
        thumbnailUrl,
        caption,
        takenAt: takenAt ? new Date(takenAt) : null,
        width,
        height,
        fileSize,
        order: (lastPhoto?.order || 0) + 1
      }
    });

    // Update album photo count
    await db.photoAlbum.update({
      where: { id: albumId },
      data: { photoCount: { increment: 1 } }
    });

    // Set as cover if first photo
    if (!lastPhoto) {
      await db.photoAlbum.update({
        where: { id: albumId },
        data: { coverUrl: url }
      });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error creating photo:", error);
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

    const photo = await db.photo.findUnique({ where: { id } });
    if (!photo) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    await db.photo.delete({ where: { id } });

    // Update album photo count
    await db.photoAlbum.update({
      where: { id: photo.albumId },
      data: { photoCount: { decrement: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
