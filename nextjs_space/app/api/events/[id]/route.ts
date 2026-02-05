import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Get single event
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

    const event = await db.event.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        group: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, dueDate: true } },
        attendees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Error al obtener evento" },
      { status: 500 }
    );
  }
}

// PUT - Update event
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

    // Verify event exists and user can edit
    const existingEvent = await db.event.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Only creator or admin can edit
    if (existingEvent.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permisos para editar este evento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      color,
      location,
      isPublic,
      groupId,
    } = body;

    const event = await db.event.update({
      where: { id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        allDay,
        type,
        color,
        location,
        isPublic,
        groupId: groupId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        group: { select: { id: true, name: true } },
        attendees: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
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

    // Verify event exists and user can delete
    const existingEvent = await db.event.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Only creator or admin can delete
    if (existingEvent.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar este evento" },
        { status: 403 }
      );
    }

    await db.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
}
