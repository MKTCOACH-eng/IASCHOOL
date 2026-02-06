import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Dashboard del alumno
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ALUMNO") {
      return NextResponse.json({ error: "Solo para alumnos" }, { status: 403 });
    }

    // Obtener el estudiante asociado al usuario
    const student = await db.student.findUnique({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            teacher: { select: { name: true } },
          },
        },
        school: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Perfil de estudiante no encontrado" }, { status: 404 });
    }

    // Tareas pendientes (publicadas, no entregadas o devueltas)
    const pendingTasks = await db.task.findMany({
      where: {
        groupId: student.groupId!,
        status: "PUBLISHED",
        submissions: {
          none: { studentId: student.id },
        },
      },
      include: { subject: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    // Tareas entregadas pendientes de calificación
    const submittedTasks = await db.submission.count({
      where: {
        studentId: student.id,
        status: "PENDING",
      },
    });

    // Próximos eventos del grupo
    const upcomingEvents = await db.event.findMany({
      where: {
        OR: [
          { groupId: student.groupId },
          { schoolId: student.schoolId, isPublic: true },
        ],
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    });

    // Asistencia del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceStats = await db.attendance.groupBy({
      by: ["status"],
      where: {
        studentId: student.id,
        date: { gte: startOfMonth },
      },
      _count: true,
    });

    // Calificaciones recientes
    const recentGrades = await db.submission.findMany({
      where: {
        studentId: student.id,
        status: "REVIEWED",
      },
      include: {
        task: {
          include: { subject: true },
        },
      },
      orderBy: { reviewedAt: "desc" },
      take: 5,
    });

    // Calcular promedio general
    const allGrades = await db.submission.findMany({
      where: {
        studentId: student.id,
        status: "REVIEWED",
        score: { not: null },
      },
      include: {
        task: true,
      },
    });

    let averageGrade = 0;
    if (allGrades.length > 0) {
      const totalWeighted = allGrades.reduce((sum, s) => {
        const normalized = ((s.score || 0) / s.task.maxScore) * 100;
        return sum + normalized;
      }, 0);
      averageGrade = Math.round(totalWeighted / allGrades.length);
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        group: student.group?.name,
        grade: student.group?.grade,
        teacher: student.group?.teacher?.name,
        school: student.school.name,
      },
      stats: {
        pendingTasks: pendingTasks.length,
        submittedPending: submittedTasks,
        averageGrade,
        attendance: attendanceStats.reduce((acc, a) => {
          acc[a.status] = a._count;
          return acc;
        }, {} as Record<string, number>),
      },
      pendingTasks,
      upcomingEvents,
      recentGrades,
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
