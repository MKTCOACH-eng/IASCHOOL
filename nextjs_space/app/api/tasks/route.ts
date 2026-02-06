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

// GET - Listar tareas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const status = searchParams.get("status");

    let whereClause: Record<string, unknown> = {};

    // Filtrar según rol
    if (user.role === "PROFESOR") {
      // Profesor ve tareas de sus grupos
      whereClause = {
        teacherId: user.id,
        ...(groupId && { groupId }),
        ...(status && { status }),
      };
    } else if (user.role === "PADRE") {
      // Padre ve tareas de los grupos de sus hijos
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { groupId: true },
      });
      const groupIds = children.map((c) => c.groupId).filter(Boolean) as string[];
      whereClause = {
        groupId: { in: groupIds },
        status: "PUBLISHED",
        ...(groupId && groupIds.includes(groupId) && { groupId }),
      };
    } else if (user.role === "ADMIN") {
      // Admin ve todas las tareas de su escuela
      whereClause = {
        group: { schoolId: user.schoolId },
        ...(groupId && { groupId }),
        ...(status && { status }),
      };
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        subject: true,
        group: true,
        teacher: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Error al obtener tareas" }, { status: 500 });
  }
}

// POST - Crear tarea (solo PROFESOR o ADMIN)
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
    const {
      title,
      description,
      instructions,
      groupId,
      subjectId,
      dueDate,
      maxScore,
      status,
    } = body;

    if (!title?.trim() || !groupId) {
      return NextResponse.json(
        { error: "Título y grupo son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el grupo pertenece a la escuela e incluir estudiantes con padres
    const group = await db.group.findFirst({
      where: { id: groupId, schoolId: user.schoolId },
      include: {
        school: true,
        students: {
          where: { isActive: true },
          include: {
            parents: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    // Obtener nombre de la materia si existe
    let subjectName: string | undefined;
    if (subjectId) {
      const subject = await db.subject.findUnique({ where: { id: subjectId } });
      subjectName = subject?.name;
    }

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        instructions: instructions?.trim() || null,
        groupId,
        teacherId: user.id,
        subjectId: subjectId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        subject: true,
        group: true,
        teacher: { select: { id: true, name: true } },
      },
    });

    // Enviar notificaciones por email si la tarea se publica
    if (status === "PUBLISHED") {
      const teacherName = (session.user as { name?: string }).name || "Profesor";
      const schoolName = group.school.name;
      
      // Crear un set para evitar enviar múltiples emails al mismo padre
      const notifiedParents = new Set<string>();
      
      // Enviar email a cada padre de cada estudiante del grupo
      for (const student of group.students) {
        for (const parent of student.parents) {
          // Evitar duplicados (un padre puede tener varios hijos en el mismo grupo)
          if (notifiedParents.has(parent.id)) continue;
          notifiedParents.add(parent.id);
          
          // Enviar notificación de forma asíncrona (no bloquea la respuesta)
          sendNewTaskNotification({
            parentEmail: parent.email,
            parentName: parent.name,
            studentName: `${student.firstName} ${student.lastName}`,
            taskTitle: task.title,
            teacherName,
            subjectName,
            dueDate: task.dueDate,
            schoolName,
          }).catch((err) => {
            console.error(`Error sending task notification to ${parent.email}:`, err);
          });
        }
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Error al crear tarea" }, { status: 500 });
  }
}
