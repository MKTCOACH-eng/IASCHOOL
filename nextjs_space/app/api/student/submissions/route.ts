import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// POST - Entregar tarea (alumno)
export async function POST(request: NextRequest) {
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

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { taskId, content, attachments } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Se requiere taskId" }, { status: 400 });
    }

    // Verificar que la tarea existe y está publicada
    const task = await db.task.findFirst({
      where: {
        id: taskId,
        groupId: student.groupId!,
        status: { in: ["PUBLISHED"] },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada o cerrada" }, { status: 404 });
    }

    // Verificar si ya existe una entrega
    const existingSubmission = await db.submission.findUnique({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id,
        },
      },
    });

    // Determinar si es tarde
    const isLate = task.dueDate ? new Date() > task.dueDate : false;

    if (existingSubmission) {
      // Actualizar entrega existente (si fue devuelta)
      if (existingSubmission.status !== "RETURNED" && existingSubmission.status !== "PENDING") {
        return NextResponse.json(
          { error: "Esta tarea ya fue calificada y no puede modificarse" },
          { status: 400 }
        );
      }

      const updatedSubmission = await db.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: content || existingSubmission.content,
          status: "PENDING",
          submittedAt: new Date(),
          isLate,
          attachments: attachments?.length
            ? {
                deleteMany: {},
                create: attachments.map((a: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string; cloudStoragePath?: string }) => ({
                  fileName: a.fileName,
                  fileUrl: a.fileUrl,
                  fileSize: a.fileSize,
                  mimeType: a.mimeType,
                  cloudStoragePath: a.cloudStoragePath,
                  isPublic: false,
                })),
              }
            : undefined,
        },
        include: { attachments: true },
      });

      return NextResponse.json(updatedSubmission);
    }

    // Crear nueva entrega
    const submission = await db.submission.create({
      data: {
        taskId,
        studentId: student.id,
        content: content || null,
        status: "PENDING",
        isLate,
        attachments: attachments?.length
          ? {
              create: attachments.map((a: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string; cloudStoragePath?: string }) => ({
                fileName: a.fileName,
                fileUrl: a.fileUrl,
                fileSize: a.fileSize,
                mimeType: a.mimeType,
                cloudStoragePath: a.cloudStoragePath,
                isPublic: false,
              })),
            }
          : undefined,
      },
      include: { attachments: true },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Error al entregar tarea" }, { status: 500 });
  }
}
