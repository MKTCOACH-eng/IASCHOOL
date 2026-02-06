import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener reporte de calificaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");

    // Determinar qué estudiantes consultar según el rol
    let studentIds: string[] = [];

    if (user.role === "PADRE") {
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true },
      });
      studentIds = children.map((c) => c.id);
      
      if (studentId && !studentIds.includes(studentId)) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      if (studentId) {
        studentIds = [studentId];
      }
    } else if (user.role === "PROFESOR") {
      const groups = await db.group.findMany({
        where: { teacherId: user.id },
        include: { students: { select: { id: true } } },
      });
      studentIds = groups.flatMap((g) => g.students.map((s) => s.id));
      
      if (studentId && !studentIds.includes(studentId)) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      if (studentId) {
        studentIds = [studentId];
      }
    } else if (user.role === "ADMIN") {
      if (studentId) {
        studentIds = [studentId];
      } else {
        const students = await db.student.findMany({
          where: { schoolId: user.schoolId },
          select: { id: true },
        });
        studentIds = students.map((s) => s.id);
      }
    }

    if (studentIds.length === 0) {
      return NextResponse.json({
        students: [],
        subjects: [],
      });
    }

    // Obtener estudiantes con sus entregas calificadas
    const students = await db.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        group: true,
        submissions: {
          where: {
            status: "REVIEWED",
            score: { not: null },
            ...(subjectId && { task: { subjectId } }),
          },
          include: {
            task: {
              include: { subject: true },
            },
          },
          orderBy: { reviewedAt: "desc" },
        },
      },
    });

    // Obtener materias disponibles
    const subjects = await db.subject.findMany({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { name: "asc" },
    });

    // Formatear datos de estudiantes con calificaciones
    const studentsWithGrades = students.map((student) => {
      // Agrupar calificaciones por materia
      const gradesBySubject = new Map<string, {
        subjectId: string;
        subjectName: string;
        subjectColor: string;
        grades: {
          id: string;
          taskId: string;
          taskTitle: string;
          score: number;
          maxScore: number;
          percentage: number;
          feedback: string | null;
          submittedAt: string;
          reviewedAt: string | null;
          isLate: boolean;
        }[];
        average: number;
        totalTasks: number;
      }>();

      student.submissions.forEach((submission) => {
        const subjectKey = submission.task.subjectId || "sin-materia";
        const subjectName = submission.task.subject?.name || "Sin materia";
        const subjectColor = submission.task.subject?.color || "#6B7280";

        if (!gradesBySubject.has(subjectKey)) {
          gradesBySubject.set(subjectKey, {
            subjectId: subjectKey,
            subjectName,
            subjectColor,
            grades: [],
            average: 0,
            totalTasks: 0,
          });
        }

        const subjectData = gradesBySubject.get(subjectKey)!;
        const percentage = ((submission.score as number) / submission.task.maxScore) * 100;
        
        subjectData.grades.push({
          id: submission.id,
          taskId: submission.taskId,
          taskTitle: submission.task.title,
          score: submission.score as number,
          maxScore: submission.task.maxScore,
          percentage: Math.round(percentage * 10) / 10,
          feedback: submission.feedback,
          submittedAt: submission.submittedAt.toISOString(),
          reviewedAt: submission.reviewedAt?.toISOString() || null,
          isLate: submission.isLate,
        });
      });

      // Calcular promedios por materia
      gradesBySubject.forEach((subjectData) => {
        const percentages = subjectData.grades.map((g) => g.percentage);
        subjectData.average = percentages.length > 0
          ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10
          : 0;
        subjectData.totalTasks = subjectData.grades.length;
      });

      // Calcular promedio general
      const allPercentages = student.submissions.map(
        (s) => ((s.score as number) / s.task.maxScore) * 100
      );
      const overallAverage = allPercentages.length > 0
        ? Math.round((allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length) * 10) / 10
        : 0;

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        groupName: student.group?.name || "Sin grupo",
        overallAverage,
        totalGradedTasks: student.submissions.length,
        bySubject: Array.from(gradesBySubject.values()).sort((a, b) => 
          a.subjectName.localeCompare(b.subjectName)
        ),
      };
    });

    return NextResponse.json({
      students: studentsWithGrades,
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, color: s.color })),
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Error al obtener calificaciones" },
      { status: 500 }
    );
  }
}
