import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Listar tareas del alumno
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ALUMNO") {
      return NextResponse.json({ error: "Solo para alumnos" }, { status: 403 });
    }

    const student = await db.student.findUnique({
      where: { userId: user.id },
    });

    if (!student || !student.groupId) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // pending, submitted, graded

    let tasks;

    if (filter === "pending") {
      // Tareas sin entregar
      tasks = await db.task.findMany({
        where: {
          groupId: student.groupId,
          status: "PUBLISHED",
          submissions: {
            none: { studentId: student.id },
          },
        },
        include: {
          subject: true,
          teacher: { select: { name: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: "asc" },
      });
    } else if (filter === "submitted") {
      // Tareas entregadas (pendientes de revisión)
      tasks = await db.task.findMany({
        where: {
          groupId: student.groupId,
          submissions: {
            some: {
              studentId: student.id,
              status: { in: ["PENDING", "RETURNED"] },
            },
          },
        },
        include: {
          subject: true,
          teacher: { select: { name: true } },
          submissions: {
            where: { studentId: student.id },
            include: { attachments: true },
          },
        },
        orderBy: { dueDate: "desc" },
      });
    } else if (filter === "graded") {
      // Tareas calificadas
      tasks = await db.task.findMany({
        where: {
          groupId: student.groupId,
          submissions: {
            some: {
              studentId: student.id,
              status: "REVIEWED",
            },
          },
        },
        include: {
          subject: true,
          teacher: { select: { name: true } },
          submissions: {
            where: { studentId: student.id },
          },
        },
        orderBy: { dueDate: "desc" },
      });
    } else {
      // Todas las tareas publicadas
      tasks = await db.task.findMany({
        where: {
          groupId: student.groupId,
          status: "PUBLISHED",
        },
        include: {
          subject: true,
          teacher: { select: { name: true } },
          submissions: {
            where: { studentId: student.id },
          },
        },
        orderBy: { dueDate: "desc" },
      });
    }

    return NextResponse.json({ tasks, studentId: student.id });
  } catch (error) {
    console.error("Error fetching student tasks:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
