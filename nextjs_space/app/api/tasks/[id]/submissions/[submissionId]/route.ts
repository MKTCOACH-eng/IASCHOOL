import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// PUT - Calificar/revisar entrega (solo PROFESOR o ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "PROFESOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: taskId, submissionId } = await params;
    const body = await request.json();
    const { score, feedback, status } = body;

    // Verificar que la entrega existe y pertenece a la tarea
    const submission = await db.submission.findFirst({
      where: { id: submissionId, taskId },
      include: { task: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Entrega no encontrada" }, { status: 404 });
    }

    // Verificar que el profesor tiene acceso
    if (user.role === "PROFESOR" && submission.task.teacherId !== user.id) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    // Validar score
    if (score !== undefined && score !== null) {
      if (score < 0 || score > submission.task.maxScore) {
        return NextResponse.json(
          { error: `La calificación debe estar entre 0 y ${submission.task.maxScore}` },
          { status: 400 }
        );
      }
    }

    const updated = await db.submission.update({
      where: { id: submissionId },
      data: {
        score: score !== undefined ? score : undefined,
        feedback: feedback !== undefined ? feedback?.trim() || null : undefined,
        status: status || (score !== undefined ? "REVIEWED" : undefined),
        reviewedAt: score !== undefined ? new Date() : undefined,
        reviewedById: score !== undefined ? user.id : undefined,
      },
      include: {
        student: true,
        attachments: true,
        reviewedBy: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Error al actualizar entrega" }, { status: 500 });
  }
}
