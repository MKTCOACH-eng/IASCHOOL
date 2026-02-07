import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// Update student profile photo
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
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { photoUrl } = await req.json();

    if (!photoUrl) {
      return NextResponse.json({ error: "URL de foto requerida" }, { status: 400 });
    }

    const student = await db.student.update({
      where: { id: params.id },
      data: { photoUrl },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student photo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// Delete student profile photo
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    await db.student.update({
      where: { id: params.id },
      data: { photoUrl: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student photo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
