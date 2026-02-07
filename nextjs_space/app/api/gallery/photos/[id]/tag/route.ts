import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// Manual tagging of students in photos
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { studentId, x, y, width, height } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Estudiante requerido" }, { status: 400 });
    }

    const tag = await db.photoTag.create({
      data: {
        photoId: params.id,
        studentId,
        x,
        y,
        width,
        height,
        isManual: true,
        confidence: 1.0
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID requerido" }, { status: 400 });
    }

    await db.photoTag.delete({ where: { id: tagId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
