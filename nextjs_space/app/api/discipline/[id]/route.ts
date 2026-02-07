import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma as db } from '@/lib/db';

// GET - Get single record
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

    const record = await db.disciplineRecord.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            group: true,
            parents: { select: { id: true, name: true } },
          },
        },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    // Check access
    if (user.role === 'PADRE') {
      const isParent = record.student.parents.some((p: { id: string }) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
      }
    } else if (record.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT - Update record
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
      type,
      severity,
      description,
      location,
      actionTaken,
      parentNotified,
      parentResponse,
      resolved,
    } = body;

    const record = await db.disciplineRecord.findUnique({ where: { id } });
    if (!record || record.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    const updated = await db.disciplineRecord.update({
      where: { id },
      data: {
        type: type || record.type,
        severity: severity || record.severity,
        description: description !== undefined ? description : record.description,
        location: location !== undefined ? location : record.location,
        actionTaken: actionTaken !== undefined ? actionTaken : record.actionTaken,
        parentNotified: parentNotified !== undefined ? parentNotified : record.parentNotified,
        parentNotifiedAt: parentNotified && !record.parentNotified ? new Date() : record.parentNotifiedAt,
        parentResponse: parentResponse !== undefined ? parentResponse : record.parentResponse,
        resolved: resolved !== undefined ? resolved : record.resolved,
        resolvedAt: resolved && !record.resolved ? new Date() : record.resolvedAt,
      },
      include: {
        student: { include: { group: true } },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE - Delete record
export async function DELETE(
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
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const record = await db.disciplineRecord.findUnique({ where: { id } });
    if (!record || record.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    await db.disciplineRecord.delete({ where: { id } });

    return NextResponse.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
