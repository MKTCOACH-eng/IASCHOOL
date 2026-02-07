import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - List nurse visits
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const user = session.user as { id: string; role: string; schoolId: string };

    let whereClause: Record<string, unknown> = {
      schoolId: user.schoolId,
    };

    if (user.role === 'PADRE') {
      const children = await db.student.findMany({
        where: {
          parents: { some: { id: user.id } },
          isActive: true,
        },
        select: { id: true },
      });
      whereClause.studentId = { in: children.map((c: { id: string }) => c.id) };
    } else if (studentId) {
      whereClause.studentId = studentId;
    }

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.arrivalTime = { gte: startOfDay, lte: endOfDay };
    }

    const visits = await db.nurseVisit.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            group: true,
            medicalInfo: true,
          },
        },
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { arrivalTime: 'desc' },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching nurse visits:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create nurse visit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    if (!['ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      type,
      chiefComplaint,
      symptoms,
      vitalSigns,
      assessment,
      treatment,
      medicationGiven,
      followUpRequired,
      followUpNotes,
    } = body;

    if (!studentId || !type || !chiefComplaint) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    const visit = await db.nurseVisit.create({
      data: {
        studentId,
        schoolId: user.schoolId,
        type,
        chiefComplaint,
        symptoms,
        vitalSigns: vitalSigns ? JSON.stringify(vitalSigns) : null,
        assessment,
        treatment,
        medicationGiven,
        followUpRequired: followUpRequired || false,
        followUpNotes,
        recordedById: user.id,
      },
      include: {
        student: { include: { group: true, medicalInfo: true } },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Error creating nurse visit:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
