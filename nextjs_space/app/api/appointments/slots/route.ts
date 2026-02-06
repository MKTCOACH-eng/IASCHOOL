import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

const DAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

// GET - Obtener slots disponibles para una fecha específica
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const dateStr = searchParams.get("date"); // formato: YYYY-MM-DD

    if (!teacherId || !dateStr) {
      return NextResponse.json({ error: "Se requiere teacherId y date" }, { status: 400 });
    }

    const date = new Date(dateStr);
    const dayOfWeek = DAY_MAP[date.getDay()];

    // Obtener disponibilidad del profesor para ese día
    const availability = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        dayOfWeek: dayOfWeek as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
        isActive: true,
      },
    });

    if (availability.length === 0) {
      return NextResponse.json({ slots: [], message: "El profesor no tiene disponibilidad este día" });
    }

    // Obtener citas existentes para ese día
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        teacherId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ["CANCELLED"] },
      },
      select: { startTime: true, endTime: true },
    });

    const bookedTimes = new Set(existingAppointments.map(a => a.startTime));

    // Generar slots disponibles
    const slots: Array<{ startTime: string; endTime: string; location?: string | null }> = [];

    for (const avail of availability) {
      const [startHour, startMin] = avail.startTime.split(":").map(Number);
      const [endHour, endMin] = avail.endTime.split(":").map(Number);
      const slotDuration = avail.slotDuration;

      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      while (currentTime + slotDuration <= endTime) {
        const slotStart = `${String(Math.floor(currentTime / 60)).padStart(2, "0")}:${String(currentTime % 60).padStart(2, "0")}`;
        const slotEnd = `${String(Math.floor((currentTime + slotDuration) / 60)).padStart(2, "0")}:${String((currentTime + slotDuration) % 60).padStart(2, "0")}`;

        if (!bookedTimes.has(slotStart)) {
          slots.push({
            startTime: slotStart,
            endTime: slotEnd,
            location: avail.location,
          });
        }

        currentTime += slotDuration;
      }
    }

    // Ordenar por hora
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return NextResponse.json({ slots, date: dateStr, dayOfWeek });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
