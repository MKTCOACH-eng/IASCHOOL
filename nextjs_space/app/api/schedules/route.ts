import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// GET - Obtener horarios
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    let whereClause: any = { isActive: true };

    // Filtrar por rol
    if (user.role === "ALUMNO") {
      // Obtener el grupo del alumno
      const student = await db.student.findFirst({
        where: { userId: user.id },
        select: { groupId: true }
      });
      if (student?.groupId) {
        whereClause.groupId = student.groupId;
      } else {
        return NextResponse.json([]);
      }
    } else if (user.role === "PADRE") {
      // Obtener grupos de los hijos
      const children = await db.student.findMany({
        where: {
          parents: { some: { id: user.id } },
          isActive: true
        },
        select: { groupId: true }
      });
      const groupIds = children.map(c => c.groupId).filter(Boolean) as string[];
      if (groupIds.length === 0) {
        return NextResponse.json([]);
      }
      whereClause.groupId = groupId && groupIds.includes(groupId) ? groupId : { in: groupIds };
    } else if (user.role === "PROFESOR") {
      // Horarios donde el profesor da clase
      whereClause.teacherId = user.id;
      if (groupId) {
        whereClause.groupId = groupId;
      }
    } else if (user.role === "ADMIN") {
      whereClause.schoolId = user.schoolId;
      if (groupId) {
        whereClause.groupId = groupId;
      }
    }

    const schedules = await db.schedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } }
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear horario (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const { subjectId, groupId, teacherId, dayOfWeek, startTime, endTime, classroom } = await req.json();

    if (!subjectId || !groupId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Verificar conflictos de horario
    const conflict = await db.schedule.findFirst({
      where: {
        schoolId: user.schoolId,
        dayOfWeek,
        isActive: true,
        OR: [
          // Mismo profesor en otra clase
          {
            teacherId,
            OR: [
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              { startTime: { lt: endTime }, endTime: { gte: endTime } },
              { startTime: { gte: startTime }, endTime: { lte: endTime } }
            ]
          },
          // Mismo grupo en otra clase
          {
            groupId,
            OR: [
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              { startTime: { lt: endTime }, endTime: { gte: endTime } },
              { startTime: { gte: startTime }, endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({ 
        error: "Conflicto de horario: el profesor o grupo ya tiene clase en ese horario" 
      }, { status: 400 });
    }

    const schedule = await db.schedule.create({
      data: {
        subjectId,
        groupId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        classroom,
        schoolId: user.schoolId
      },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar horario (solo admin)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await db.schedule.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
