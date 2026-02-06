import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener encuesta específica con resultados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        group: { select: { name: true } },
        createdBy: { select: { name: true } },
        options: {
          include: {
            votes: {
              include: { user: { select: { id: true, name: true } } },
            },
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    let hasAccess = false;
    if (user.role === "ADMIN") {
      hasAccess = true;
    } else if (user.role === "PADRE" || user.role === "VOCAL") {
      const child = await db.student.findFirst({
        where: {
          groupId: poll.groupId,
          parents: { some: { id: user.id } },
        },
      });
      hasAccess = !!child;
    } else if (user.role === "PROFESOR") {
      const group = await db.group.findFirst({
        where: { id: poll.groupId, teacherId: user.id },
      });
      hasAccess = !!group;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PUT - Actualizar encuesta (cerrar)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const poll = await db.poll.findUnique({ where: { id } });

    if (!poll) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }

    // Solo el creador o admin puede cerrar
    if (poll.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const updated = await db.poll.update({
      where: { id },
      data: { status: status || "CLOSED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating poll:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE - Eliminar encuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const poll = await db.poll.findUnique({ where: { id } });

    if (!poll) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }

    // Solo el creador o admin puede eliminar
    if (poll.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await db.poll.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting poll:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
