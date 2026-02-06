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

// GET - Listar citas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const where: Record<string, unknown> = {};

    // Filtrar por rol
    if (user.role === "PROFESOR") {
      where.teacherId = user.id;
    } else if (user.role === "PADRE") {
      where.parentId = user.id;
    } else if (user.role === "ADMIN") {
      // Admin ve todas las citas de su escuela
      const schoolUsers = await prisma.user.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true },
      });
      where.teacherId = { in: schoolUsers.map(u => u.id) };
    }

    if (status) {
      where.status = status;
    }

    if (fromDate) {
      where.scheduledDate = { ...((where.scheduledDate as object) || {}), gte: new Date(fromDate) };
    }
    if (toDate) {
      where.scheduledDate = { ...((where.scheduledDate as object) || {}), lte: new Date(toDate) };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        parent: {
          select: { id: true, name: true, email: true, phone: true },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, group: { select: { name: true } } },
        },
      },
      orderBy: [
        { scheduledDate: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear cita (solo padres)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    if (user.role !== "PADRE") {
      return NextResponse.json({ error: "Solo los padres pueden agendar citas" }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, studentId, scheduledDate, startTime, endTime, subject, notes, location } = body;

    if (!teacherId || !scheduledDate || !startTime || !endTime || !subject) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que el profesor existe y tiene disponibilidad
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: "PROFESOR" },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Verificar que no hay conflicto de horario
    const date = new Date(scheduledDate);
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        teacherId,
        scheduledDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        startTime,
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json({ error: "Este horario ya está ocupado" }, { status: 409 });
    }

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        teacherId,
        parentId: user.id,
        studentId: studentId || null,
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        subject,
        notes,
        location,
        status: "PENDING",
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
