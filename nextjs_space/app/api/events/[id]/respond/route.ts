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

// POST - Respond to event invitation
export async function POST(
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
    const { status } = body; // CONFIRMED or DECLINED

    if (!status || !['CONFIRMED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser CONFIRMED o DECLINED" },
        { status: 400 }
      );
    }

    // Find the attendance record
    const attendance = await db.eventAttendee.findFirst({
      where: {
        eventId: id,
        userId: user.id,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "No está invitado a este evento" },
        { status: 404 }
      );
    }

    // Update response
    const updated = await db.eventAttendee.update({
      where: { id: attendance.id },
      data: {
        status,
        responseAt: new Date(),
      },
      include: {
        event: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      message: status === 'CONFIRMED' 
        ? 'Asistencia confirmada' 
        : 'Has declinado la invitación',
    });
  } catch (error) {
    console.error("Error responding to event:", error);
    return NextResponse.json(
      { error: "Error al responder al evento" },
      { status: 500 }
    );
  }
}
