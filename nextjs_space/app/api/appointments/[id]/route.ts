import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string | null;
}

type RouteContext = { params: Promise<{ id: string }> };

// GET - Obtener detalles de una cita
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { id } = await context.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true, phone: true } },
        parent: { select: { id: true, name: true, email: true, phone: true } },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            group: { select: { name: true, grade: true } },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    const hasAccess =
      user.id === appointment.teacherId ||
      user.id === appointment.parentId ||
      user.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// PATCH - Actualizar cita (confirmar, completar, agregar notas)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { id } = await context.params;
    const body = await request.json();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    const isTeacher = user.id === appointment.teacherId;
    const isParent = user.id === appointment.parentId;
    const isAdmin = user.role === "ADMIN";

    if (!isTeacher && !isParent && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    // El profesor puede confirmar, completar y agregar notas
    if (isTeacher || isAdmin) {
      if (body.status) {
        updateData.status = body.status;
      }
      if (body.teacherNotes !== undefined) {
        updateData.teacherNotes = body.teacherNotes;
      }
    }

    // El padre puede actualizar notas y subject
    if (isParent) {
      if (body.notes !== undefined) {
        updateData.notes = body.notes;
      }
      if (body.subject && appointment.status === "PENDING") {
        updateData.subject = body.subject;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Sin cambios para aplicar" }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Cancelar cita
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "Cancelada por el usuario";

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    const hasAccess =
      user.id === appointment.teacherId ||
      user.id === appointment.parentId ||
      user.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // No se puede cancelar una cita ya completada
    if (appointment.status === "COMPLETED") {
      return NextResponse.json({ error: "No se puede cancelar una cita completada" }, { status: 400 });
    }

    const cancelled = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledBy: user.id,
        cancelReason: reason,
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, appointment: cancelled });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
