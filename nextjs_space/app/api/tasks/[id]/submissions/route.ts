import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Listar entregas de una tarea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id: taskId } = await params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { group: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    if (user.role === "PROFESOR" && task.teacherId !== user.id) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    let whereClause: Record<string, unknown> = { taskId };

    // Si es padre, solo ver entregas de sus hijos
    if (user.role === "PADRE") {
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } }, groupId: task.groupId },
        select: { id: true },
      });
      whereClause.studentId = { in: children.map((c) => c.id) };
    }

    const submissions = await db.submission.findMany({
      where: whereClause,
      include: {
        student: true,
        attachments: true,
        reviewedBy: { select: { name: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Error al obtener entregas" }, { status: 500 });
  }
}

// POST - Crear/actualizar entrega
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id: taskId } = await params;

    // Solo padres pueden entregar (en nombre de sus hijos)
    if (user.role !== "PADRE" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo padres pueden enviar entregas" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentId, content, attachments } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "ID del estudiante requerido" },
        { status: 400 }
      );
    }

    // Verificar que la tarea existe y está abierta
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }
    if (task.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "La tarea no está abierta para entregas" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante pertenece al padre
    if (user.role === "PADRE") {
      const student = await db.student.findFirst({
        where: { id: studentId, parents: { some: { id: user.id } } },
      });
      if (!student) {
        return NextResponse.json(
          { error: "Estudiante no encontrado o sin acceso" },
          { status: 403 }
        );
      }
    }

    // Verificar si ya existe una entrega
    const existingSubmission = await db.submission.findUnique({
      where: { taskId_studentId: { taskId, studentId } },
    });

    // Determinar si es entrega tardía
    const isLate = task.dueDate ? new Date() > task.dueDate : false;

    if (existingSubmission) {
      // Actualizar entrega existente
      const updated = await db.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: content?.trim() || null,
          isLate: isLate || existingSubmission.isLate,
          status: "PENDING",
          attachments: attachments?.length
            ? {
                deleteMany: {},
                create: attachments.map((a: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string; cloudStoragePath?: string }) => ({
                  fileName: a.fileName,
                  fileUrl: a.fileUrl,
                  fileSize: a.fileSize,
                  mimeType: a.mimeType,
                  cloudStoragePath: a.cloudStoragePath,
                })),
              }
            : undefined,
        },
        include: {
          student: true,
          attachments: true,
        },
      });
      return NextResponse.json(updated);
    }

    // Crear nueva entrega
    const submission = await db.submission.create({
      data: {
        taskId,
        studentId,
        content: content?.trim() || null,
        isLate,
        status: isLate ? "LATE" : "PENDING",
        attachments: attachments?.length
          ? {
              create: attachments.map((a: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string; cloudStoragePath?: string }) => ({
                fileName: a.fileName,
                fileUrl: a.fileUrl,
                fileSize: a.fileSize,
                mimeType: a.mimeType,
                cloudStoragePath: a.cloudStoragePath,
              })),
            }
          : undefined,
      },
      include: {
        student: true,
        attachments: true,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Error al crear entrega" }, { status: 500 });
  }
}
