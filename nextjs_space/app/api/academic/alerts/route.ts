import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";
import { SubmissionStatus } from "@prisma/client";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

type AlertType = "PROXIMA" | "VENCIDA" | "PENDIENTE_CALIFICAR" | "SIN_ENTREGAR";
type AlertPriority = "HIGH" | "MEDIUM" | "LOW";

interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  studentName?: string;
  subjectName?: string;
  daysRemaining?: number;
  daysOverdue?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const alerts: Alert[] = [];

    if (user.role === "PADRE") {
      // Obtener hijos del padre
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true, firstName: true, lastName: true, groupId: true },
      });

      if (children.length === 0) {
        return NextResponse.json({ alerts: [], summary: { total: 0, high: 0, medium: 0, low: 0 } });
      }

      const childIds = children.map((c) => c.id);
      const groupIds = children.map((c) => c.groupId).filter(Boolean) as string[];

      // Tareas publicadas para los grupos de los hijos
      const tasks = await db.task.findMany({
        where: {
          groupId: { in: groupIds },
          status: "PUBLISHED",
          dueDate: { not: null },
        },
        include: {
          subject: { select: { name: true } },
          submissions: {
            where: { studentId: { in: childIds } },
            select: { studentId: true, status: true },
          },
        },
      });

      for (const task of tasks) {
        if (!task.dueDate) continue;
        const dueDate = new Date(task.dueDate);
        
        for (const child of children) {
          if (child.groupId !== task.groupId) continue;

          const submission = task.submissions.find((s) => s.studentId === child.id);
          // PENDING = entregada pendiente de revisión, REVIEWED = calificada
          const hasSubmitted = submission?.status === SubmissionStatus.PENDING || 
                               submission?.status === SubmissionStatus.REVIEWED ||
                               submission?.status === SubmissionStatus.LATE;

          // Tareas próximas a vencer (sin entregar)
          if (!hasSubmitted && dueDate > now && dueDate <= threeDaysFromNow) {
            const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            alerts.push({
              id: `${task.id}-${child.id}-proxima`,
              type: "PROXIMA",
              priority: daysRemaining <= 1 ? "HIGH" : "MEDIUM",
              title: `Tarea próxima a vencer`,
              description: `"${task.title}" vence en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`,
              taskId: task.id,
              taskTitle: task.title,
              dueDate: task.dueDate.toISOString(),
              studentName: `${child.firstName} ${child.lastName}`,
              subjectName: task.subject?.name,
              daysRemaining,
            });
          }

          // Tareas vencidas sin entregar
          if (!hasSubmitted && dueDate < now) {
            const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            alerts.push({
              id: `${task.id}-${child.id}-vencida`,
              type: "VENCIDA",
              priority: "HIGH",
              title: `Tarea vencida sin entregar`,
              description: `"${task.title}" venció hace ${daysOverdue} día${daysOverdue !== 1 ? "s" : ""}`,
              taskId: task.id,
              taskTitle: task.title,
              dueDate: task.dueDate.toISOString(),
              studentName: `${child.firstName} ${child.lastName}`,
              subjectName: task.subject?.name,
              daysOverdue,
            });
          }
        }
      }
    } else if (user.role === "PROFESOR") {
      // Obtener grupos del profesor
      const groups = await db.group.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      const groupIds = groups.map((g) => g.id);

      // Tareas del profesor con entregas pendientes
      const tasks = await db.task.findMany({
        where: {
          OR: [
            { teacherId: user.id },
            { groupId: { in: groupIds } },
          ],
          status: "PUBLISHED",
        },
        include: {
          subject: { select: { name: true } },
          group: { select: { name: true, _count: { select: { students: true } } } },
          submissions: {
            where: { status: SubmissionStatus.PENDING }, // Pendiente de revisión
            include: {
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      for (const task of tasks) {
        // Entregas pendientes de calificar
        for (const submission of task.submissions) {
          alerts.push({
            id: `${task.id}-${submission.id}-calificar`,
            type: "PENDIENTE_CALIFICAR",
            priority: "MEDIUM",
            title: `Entrega pendiente de calificar`,
            description: `${submission.student.firstName} ${submission.student.lastName} entregó "${task.title}"`,
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.dueDate?.toISOString() || new Date().toISOString(),
            studentName: `${submission.student.firstName} ${submission.student.lastName}`,
            subjectName: task.subject?.name,
          });
        }
      }
    } else if (user.role === "ADMIN") {
      // Admin ve un resumen general - contar entregas pendientes de tareas de su escuela
      const pendingReviews = await db.submission.count({
        where: {
          status: SubmissionStatus.PENDING,
          task: {
            group: { schoolId: user.schoolId },
          },
        },
      });

      if (pendingReviews > 0) {
        alerts.push({
          id: "admin-pending-reviews",
          type: "PENDIENTE_CALIFICAR",
          priority: "LOW",
          title: `Entregas pendientes de revisión`,
          description: `Hay ${pendingReviews} entrega${pendingReviews !== 1 ? "s" : ""} esperando calificación`,
          taskId: "",
          taskTitle: "",
          dueDate: new Date().toISOString(),
        });
      }
    }

    // Ordenar por prioridad y fecha
    alerts.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const summary = {
      total: alerts.length,
      high: alerts.filter((a) => a.priority === "HIGH").length,
      medium: alerts.filter((a) => a.priority === "MEDIUM").length,
      low: alerts.filter((a) => a.priority === "LOW").length,
    };

    return NextResponse.json({ alerts, summary });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Error al obtener alertas" },
      { status: 500 }
    );
  }
}
