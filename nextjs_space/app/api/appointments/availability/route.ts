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

// GET - Obtener disponibilidad del profesor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    // Si es profesor, obtiene su propia disponibilidad
    // Si es padre/admin, puede ver la disponibilidad de cualquier profesor
    const targetTeacherId = teacherId || (user.role === "PROFESOR" ? user.id : null);

    if (!targetTeacherId) {
      return NextResponse.json({ error: "Se requiere teacherId" }, { status: 400 });
    }

    const availability = await prisma.teacherAvailability.findMany({
      where: {
        teacherId: targetTeacherId,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear/actualizar disponibilidad (solo profesores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;
    
    if (user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Solo profesores pueden configurar disponibilidad" }, { status: 403 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, slotDuration, location, notes } = body;

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que no haya conflictos de horario
    const existingSlot = await prisma.teacherAvailability.findFirst({
      where: {
        teacherId: user.id,
        dayOfWeek,
        startTime,
        isActive: true,
      },
    });

    if (existingSlot) {
      // Actualizar existente
      const updated = await prisma.teacherAvailability.update({
        where: { id: existingSlot.id },
        data: { endTime, slotDuration, location, notes },
      });
      return NextResponse.json(updated);
    }

    // Crear nuevo
    const availability = await prisma.teacherAvailability.create({
      data: {
        teacherId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: slotDuration || 30,
        location,
        notes,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar disponibilidad
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;
    
    if (user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Se requiere ID" }, { status: 400 });
    }

    // Verificar que pertenece al profesor
    const slot = await prisma.teacherAvailability.findFirst({
      where: { id, teacherId: user.id },
    });

    if (!slot) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    await prisma.teacherAvailability.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
