import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const album = await db.photoAlbum.findUnique({
      where: { id: params.id },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        photos: {
          orderBy: { order: 'asc' },
          include: {
            tags: {
              include: {
                student: { select: { id: true, firstName: true, lastName: true } }
              }
            }
          }
        }
      }
    });

    if (!album) {
      return NextResponse.json({ error: "\u00c1lbum no encontrado" }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const { title, description, visibility, eventDate, coverUrl } = await req.json();

    const album = await db.photoAlbum.update({
      where: { id: params.id },
      data: {
        title,
        description,
        visibility,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        coverUrl
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
