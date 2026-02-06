import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener estadísticas académicas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    // Determinar qué estudiantes consultar según el rol
    let studentIds: string[] = [];

    if (user.role === "PADRE") {
      // Padre ve estadísticas de sus hijos
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true },
      });
      studentIds = children.map((c) => c.id);
      
      // Si se especifica un estudiante, verificar que sea hijo del padre
      if (studentId && !studentIds.includes(studentId)) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      if (studentId) {
        studentIds = [studentId];
      }
    } else if (user.role === "PROFESOR") {
      // Profesor ve estadísticas de estudiantes en sus grupos
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
      // Admin ve todo
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
        summary: {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          averageScore: 0,
          completionRate: 0,
        },
        bySubject: [],
        recentActivity: [],
      });
    }

    // Obtener estudiantes con sus datos
    const students = await db.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        group: true,
        submissions: {
          include: {
            task: {
              include: { subject: true },
            },
          },
        },
      },
    });

    // Obtener todas las tareas publicadas de los grupos de estos estudiantes
    const groupIds = [...new Set(students.map((s) => s.groupId).filter(Boolean))] as string[];
    const allTasks = await db.task.findMany({
      where: {
        groupId: { in: groupIds },
        status: "PUBLISHED",
      },
      include: { subject: true },
    });

    // Calcular estadísticas por estudiante
    const studentStats = students.map((student) => {
      const studentTasks = allTasks.filter((t) => t.groupId === student.groupId);
      const submissions = student.submissions;
      const reviewedSubmissions = submissions.filter((s) => s.status === "REVIEWED");
      
      const totalTasks = studentTasks.length;
      const completedTasks = submissions.length;
      const pendingTasks = totalTasks - completedTasks;
      const lateTasks = submissions.filter((s) => s.isLate).length;
      
      const scores = reviewedSubmissions
        .filter((s) => s.score !== null)
        .map((s) => {
          const maxScore = s.task.maxScore || 100;
          return ((s.score as number) / maxScore) * 100;
        });
      
      const averageScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      
      const completionRate = totalTasks > 0
        ? (completedTasks / totalTasks) * 100
        : 0;

      // Estadísticas por materia
      const subjectMap = new Map<string, { name: string; color: string; scores: number[]; total: number; completed: number }>();
      
      studentTasks.forEach((task) => {
        const subjectId = task.subjectId || "sin-materia";
        const subjectName = task.subject?.name || "Sin materia";
        const subjectColor = task.subject?.color || "#6B7280";
        
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            name: subjectName,
            color: subjectColor,
            scores: [],
            total: 0,
            completed: 0,
          });
        }
        
        const subjectData = subjectMap.get(subjectId)!;
        subjectData.total++;
        
        const submission = submissions.find((s) => s.taskId === task.id);
        if (submission) {
          subjectData.completed++;
          if (submission.status === "REVIEWED" && submission.score !== null) {
            const normalizedScore = (submission.score / (task.maxScore || 100)) * 100;
            subjectData.scores.push(normalizedScore);
          }
        }
      });

      const bySubject = Array.from(subjectMap.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        averageScore: data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : null,
        totalTasks: data.total,
        completedTasks: data.completed,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        groupName: student.group?.name || "Sin grupo",
        totalTasks,
        completedTasks,
        pendingTasks,
        lateTasks,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        bySubject,
      };
    });

    // Calcular resumen general
    const totalTasks = studentStats.reduce((sum, s) => sum + s.totalTasks, 0);
    const completedTasks = studentStats.reduce((sum, s) => sum + s.completedTasks, 0);
    const pendingTasks = studentStats.reduce((sum, s) => sum + s.pendingTasks, 0);
    const lateTasks = studentStats.reduce((sum, s) => sum + s.lateTasks, 0);
    
    const avgScores = studentStats.filter((s) => s.averageScore > 0).map((s) => s.averageScore);
    const averageScore = avgScores.length > 0
      ? avgScores.reduce((a, b) => a + b, 0) / avgScores.length
      : 0;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Agregar estadísticas por materia globales
    const globalSubjectMap = new Map<string, { name: string; color: string; scores: number[]; total: number; completed: number }>();
    
    studentStats.forEach((student) => {
      student.bySubject.forEach((subject) => {
        if (!globalSubjectMap.has(subject.id)) {
          globalSubjectMap.set(subject.id, {
            name: subject.name,
            color: subject.color,
            scores: [],
            total: 0,
            completed: 0,
          });
        }
        const data = globalSubjectMap.get(subject.id)!;
        data.total += subject.totalTasks;
        data.completed += subject.completedTasks;
        if (subject.averageScore !== null) {
          data.scores.push(subject.averageScore);
        }
      });
    });

    const bySubject = Array.from(globalSubjectMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      color: data.color,
      averageScore: data.scores.length > 0
        ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
        : null,
      totalTasks: data.total,
      completedTasks: data.completed,
    }));

    // Actividad reciente (últimas entregas)
    const recentSubmissions = await db.submission.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        student: true,
        task: { include: { subject: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    const recentActivity = recentSubmissions.map((sub) => ({
      id: sub.id,
      type: sub.status === "REVIEWED" ? "graded" : "submitted",
      studentName: `${sub.student.firstName} ${sub.student.lastName}`,
      taskTitle: sub.task.title,
      subjectName: sub.task.subject?.name || "Sin materia",
      score: sub.score,
      maxScore: sub.task.maxScore,
      date: sub.status === "REVIEWED" ? sub.reviewedAt : sub.submittedAt,
      isLate: sub.isLate,
    }));

    return NextResponse.json({
      students: studentStats,
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        lateTasks,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
      },
      bySubject,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching academic stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
