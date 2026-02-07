import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - Get single visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };

    const visit = await db.nurseVisit.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            group: true,
            medicalInfo: true,
            parents: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 });
    }

    if (user.role === 'PADRE') {
      const isParent = visit.student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (visit.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT - Update visit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string; schoolId: string };
    if (!['ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      status,
      assessment,
      treatment,
      medicationGiven,
      followUpRequired,
      followUpNotes,
      parentNotified,
      parentNotifiedBy,
      parentResponse,
      emergencyContact,
      emergencyNotes,
    } = body;

    const visit = await db.nurseVisit.findUnique({ where: { id } });
    if (!visit || visit.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 });
    }

    const updated = await db.nurseVisit.update({
      where: { id },
      data: {
        status: status || visit.status,
        departureTime: ['RETURNED_CLASS', 'SENT_HOME', 'EMERGENCY_TRANSFER', 'COMPLETED'].includes(status) && !visit.departureTime ? new Date() : visit.departureTime,
        assessment: assessment !== undefined ? assessment : visit.assessment,
        treatment: treatment !== undefined ? treatment : visit.treatment,
        medicationGiven: medicationGiven !== undefined ? medicationGiven : visit.medicationGiven,
        followUpRequired: followUpRequired !== undefined ? followUpRequired : visit.followUpRequired,
        followUpNotes: followUpNotes !== undefined ? followUpNotes : visit.followUpNotes,
        parentNotified: parentNotified !== undefined ? parentNotified : visit.parentNotified,
        parentNotifiedAt: parentNotified && !visit.parentNotified ? new Date() : visit.parentNotifiedAt,
        parentNotifiedBy: parentNotifiedBy || visit.parentNotifiedBy,
        parentResponse: parentResponse !== undefined ? parentResponse : visit.parentResponse,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : visit.emergencyContact,
        emergencyNotes: emergencyNotes !== undefined ? emergencyNotes : visit.emergencyNotes,
      },
      include: {
        student: { include: { group: true, medicalInfo: true } },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
