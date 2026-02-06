import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener asistencias
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const month = searchParams.get("month"); // YYYY-MM

    let whereClause: Record<string, unknown> = {};

    if (user.role === "PROFESOR") {
      // Profesor ve asistencias de sus grupos
      const teacherGroups = await db.group.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      const groupIds = teacherGroups.map((g) => g.id);
      
      if (groupId && groupIds.includes(groupId)) {
        whereClause.groupId = groupId;
      } else {
        whereClause.groupId = { in: groupIds };
      }
    } else if (user.role === "PADRE") {
      // Padre ve asistencias de sus hijos
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true },
      });
      const childIds = children.map((c) => c.id);
      
      if (studentId && childIds.includes(studentId)) {
        whereClause.studentId = studentId;
      } else {
        whereClause.studentId = { in: childIds };
      }
    } else if (user.role === "ALUMNO") {
      // Alumno ve su propia asistencia
      const student = await db.student.findUnique({
        where: { userId: user.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
      }
      whereClause.studentId = student.id;
    } else if (user.role === "ADMIN") {
      // Admin ve todo de su escuela
      const schoolGroups = await db.group.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true },
      });
      whereClause.groupId = { in: schoolGroups.map((g) => g.id) };
      
      if (groupId) whereClause.groupId = groupId;
      if (studentId) whereClause.studentId = studentId;
    }

    // Filtrar por fecha o mes
    if (date) {
      whereClause.date = new Date(date);
    } else if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendances = await db.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
        group: {
          select: { id: true, name: true },
        },
        recordedBy: {
          select: { name: true },
        },
      },
      orderBy: [{ date: "desc" }, { student: { lastName: "asc" } }],
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST - Registrar asistencia (solo profesor o admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "PROFESOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const { groupId, date, attendances } = body;
    // attendances: [{ studentId, status, notes? }]

    if (!groupId || !date || !attendances?.length) {
      return NextResponse.json(
        { error: "Se requiere groupId, date y attendances" },
        { status: 400 }
      );
    }

    // Verificar acceso al grupo
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { teacherId: user.id },
          { schoolId: user.schoolId, ...(user.role === "ADMIN" ? {} : { id: "none" }) },
        ],
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado o sin acceso" }, { status: 404 });
    }

    const attendanceDate = new Date(date);

    // Upsert de asistencias (crear o actualizar)
    const results = await Promise.all(
      attendances.map(async (a: { studentId: string; status: string; notes?: string }) => {
        return db.attendance.upsert({
          where: {
            studentId_date: {
              studentId: a.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: a.status as "PRESENTE" | "AUSENTE" | "TARDANZA" | "JUSTIFICADO",
            notes: a.notes || null,
            recordedById: user.id,
          },
          create: {
            studentId: a.studentId,
            groupId,
            date: attendanceDate,
            status: a.status as "PRESENTE" | "AUSENTE" | "TARDANZA" | "JUSTIFICADO",
            notes: a.notes || null,
            recordedById: user.id,
          },
        });
      })
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({ error: "Error al registrar asistencia" }, { status: 500 });
  }
}
