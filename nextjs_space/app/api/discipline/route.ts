import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - List discipline records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');

    const user = session.user as { id: string; role: string; schoolId: string };

    let whereClause: Record<string, unknown> = {
      schoolId: user.schoolId,
    };

    if (user.role === 'PADRE') {
      // Parents only see their children's records
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
    if (severity) whereClause.severity = severity;
    if (resolved !== null && resolved !== undefined) {
      whereClause.resolved = resolved === 'true';
    }

    const records = await db.disciplineRecord.findMany({
      where: whereClause,
      include: {
        student: {
          include: { group: true },
        },
        recordedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate student discipline points
    const studentPoints: Record<string, number> = {};
    records.forEach((r: { studentId: string; points: number }) => {
      if (!studentPoints[r.studentId]) studentPoints[r.studentId] = 0;
      studentPoints[r.studentId] += r.points;
    });

    return NextResponse.json({ records, studentPoints });
  } catch (error) {
    console.error('Error fetching discipline records:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Create discipline record
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
      severity,
      date,
      description,
      location,
      witnesses,
      points,
      actionTaken,
    } = body;

    if (!studentId || !type || !description || !date) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verify student exists and belongs to school
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { select: { id: true, name: true, email: true } },
      },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    const record = await db.disciplineRecord.create({
      data: {
        studentId,
        schoolId: user.schoolId,
        type,
        severity: severity || 'MEDIUM',
        date: new Date(date),
        description,
        location,
        witnesses,
        points: points || 0,
        actionTaken,
        recordedById: user.id,
      },
      include: {
        student: { include: { group: true } },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating discipline record:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
