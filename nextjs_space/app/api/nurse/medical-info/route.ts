import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - Get student medical info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requerido' }, { status: 400 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        medicalInfo: true,
        parents: { select: { id: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    if (user.role === 'PADRE') {
      const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    return NextResponse.json(student.medicalInfo || {});
  } catch (error) {
    console.error('Error fetching medical info:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST/PUT - Create or update medical info
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    const body = await request.json();
    const { studentId, ...medicalData } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requerido' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { parents: { select: { id: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Parents can update their children's medical info, admins can update any
    if (user.role === 'PADRE') {
      const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (!['ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    } else if (student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    const medicalInfo = await db.studentMedicalInfo.upsert({
      where: { studentId },
      create: {
        studentId,
        ...medicalData,
      },
      update: medicalData,
    });

    return NextResponse.json(medicalInfo);
  } catch (error) {
    console.error('Error saving medical info:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
