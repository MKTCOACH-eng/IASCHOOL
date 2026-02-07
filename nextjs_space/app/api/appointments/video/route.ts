import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// Generate a Jitsi Meet room URL
function generateJitsiRoom(appointmentId: string, schoolCode: string): { roomId: string; meetingUrl: string } {
  // Create a unique, readable room ID
  const timestamp = Date.now().toString(36);
  const roomId = `${schoolCode}-${appointmentId.slice(-6)}-${timestamp}`;
  const meetingUrl = `https://meet.jit.si/${roomId}`;
  return { roomId, meetingUrl };
}

// POST - Create video meeting for appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId requerido' }, { status: 400 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        teacher: { include: { school: true } },
        parent: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    // Verify user is participant
    if (appointment.teacherId !== user.id && appointment.parentId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso a esta cita' }, { status: 403 });
    }

    // Generate Jitsi room
    const schoolCode = appointment.teacher.school?.code || 'school';
    const { roomId, meetingUrl } = generateJitsiRoom(appointmentId, schoolCode);

    // Update appointment with video meeting info
    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        isVideoCall: true,
        meetingUrl,
        meetingRoomId: roomId,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      appointment: updated,
      meeting: {
        roomId,
        meetingUrl,
        joinInstructions: {
          es: 'Haga clic en el enlace para unirse a la videollamada. No necesita crear una cuenta.',
          en: 'Click the link to join the video call. No account needed.',
        },
      },
    });
  } catch (error) {
    console.error('Error creating video meeting:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Remove video meeting from appointment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const user = session.user as { id: string; role: string };

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId requerido' }, { status: 400 });
    }

    const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (appointment.teacherId !== user.id && appointment.parentId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        isVideoCall: false,
        meetingUrl: null,
        meetingRoomId: null,
      },
    });

    return NextResponse.json({ message: 'Videollamada removida', appointment: updated });
  } catch (error) {
    console.error('Error removing video meeting:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
