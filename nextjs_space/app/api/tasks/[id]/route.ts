import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";
import { sendNewTaskNotification } from "@/lib/send-notification";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener tarea específica
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
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        subject: true,
        group: {
          include: {
            students: {
              include: {
                submissions: { where: { taskId: id } },
              },
            },
          },
        },
        teacher: { select: { id: true, name: true, email: true } },
        attachments: true,
        submissions: {
          include: {
            student: true,
            attachments: true,
            reviewedBy: { select: { name: true } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    if (user.role === "PADRE") {
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } }, groupId: task.groupId },
      });
      if (children.length === 0) {
        return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
      }
    } else if (user.role === "PROFESOR" && task.teacherId !== user.id) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Error al obtener tarea" }, { status: 500 });
  }
}

// PUT - Actualizar tarea
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // Solo el profesor creador o admin puede editar
    if (user.role !== "ADMIN" && task.teacherId !== user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      instructions,
      subjectId,
      dueDate,
      maxScore,
      status,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (instructions !== undefined) updateData.instructions = instructions?.trim() || null;
    if (subjectId !== undefined) updateData.subjectId = subjectId || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (maxScore !== undefined) updateData.maxScore = maxScore;
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && !task.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (status === "CLOSED") {
        updateData.closedAt = new Date();
      }
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        group: {
          include: {
            school: true,
            students: {
              include: {
                parents: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
        teacher: { select: { id: true, name: true } },
      },
    });

    // Send notifications when task is published
    if (status === "PUBLISHED" && !task.publishedAt) {
      const parents = new Map<string, { email: string; name: string; studentName: string }>();
      
      for (const student of updatedTask.group.students) {
        for (const parent of student.parents) {
          if (!parents.has(parent.id)) {
            parents.set(parent.id, {
              email: parent.email,
              name: parent.name,
              studentName: `${student.firstName} ${student.lastName}`,
            });
          }
        }
      }

      // Send notifications in background (don't block response)
      Promise.all(
        Array.from(parents.values()).map((parent) =>
          sendNewTaskNotification({
            parentEmail: parent.email,
            parentName: parent.name,
            studentName: parent.studentName,
            taskTitle: updatedTask.title,
            teacherName: updatedTask.teacher.name,
            subjectName: updatedTask.subject?.name,
            dueDate: updatedTask.dueDate,
            schoolName: updatedTask.group.school.name,
          })
        )
      ).catch((err) => console.error("Error sending task notifications:", err));
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Error al actualizar tarea" }, { status: 500 });
  }
}

// DELETE - Eliminar tarea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // Solo el profesor creador o admin puede eliminar
    if (user.role !== "ADMIN" && task.teacherId !== user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await db.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Error al eliminar tarea" }, { status: 500 });
  }
}
