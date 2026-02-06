import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Obtener métricas del dashboard
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week, month, year
    const exportFormat = searchParams.get("export");

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Obtener métricas actuales
    const [usersCount, studentsCount, groupsCount, parentsCount, teachersCount] = await Promise.all([
      prisma.user.count({ where: { schoolId: user.schoolId } }),
      prisma.student.count({ where: { schoolId: user.schoolId, isActive: true } }),
      prisma.group.count({ where: { schoolId: user.schoolId, isActive: true } }),
      prisma.user.count({ where: { schoolId: user.schoolId, role: "PADRE" } }),
      prisma.user.count({ where: { schoolId: user.schoolId, role: "PROFESOR" } }),
    ]);

    // Métricas de comunicación (periodo actual)
    const [messagesCount, announcementsCount] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: { schoolId: user.schoolId },
          createdAt: { gte: startDate },
        },
      }),
      prisma.announcement.count({
        where: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // Métricas académicas
    const [tasksCreated, submissionsCount] = await Promise.all([
      prisma.task.count({
        where: {
          group: { schoolId: user.schoolId },
          createdAt: { gte: startDate },
        },
      }),
      prisma.submission.count({
        where: {
          task: { group: { schoolId: user.schoolId } },
          submittedAt: { gte: startDate },
        },
      }),
    ]);

    // Métricas de asistencia (promedio)
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        group: { schoolId: user.schoolId },
        date: { gte: startDate },
      },
      _count: true,
    });

    const totalAttendance = attendanceStats.reduce((acc: number, s: any) => acc + s._count, 0);
    const presentCount = attendanceStats.find((s: any) => s.status === "PRESENTE")?._count || 0;
    const averageAttendance = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Métricas de pagos
    const [chargesStats, paymentsStats] = await Promise.all([
      prisma.charge.aggregate({
        where: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          charge: { schoolId: user.schoolId },
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const pendingCharges = await prisma.charge.aggregate({
      where: {
        schoolId: user.schoolId,
        status: { in: ["PENDIENTE", "VENCIDO", "PARCIAL"] },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Métricas de chatbot
    const [chatbotStats, chatbotResolved] = await Promise.all([
      prisma.chatbotConversation.count({
        where: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.chatbotConversation.count({
        where: {
          schoolId: user.schoolId,
          createdAt: { gte: startDate },
          resolved: true,
        },
      }),
    ]);

    // Métricas de citas
    const [appointmentsScheduled, appointmentsCompleted] = await Promise.all([
      prisma.appointment.count({
        where: {
          teacher: { schoolId: user.schoolId },
          createdAt: { gte: startDate },
        },
      }),
      prisma.appointment.count({
        where: {
          teacher: { schoolId: user.schoolId },
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
      }),
    ]);

    // Tendencias (7 días)
    const trends = await getWeeklyTrends(user.schoolId);

    const metrics = {
      overview: {
        totalUsers: usersCount,
        totalStudents: studentsCount,
        totalGroups: groupsCount,
        totalParents: parentsCount,
        totalTeachers: teachersCount,
      },
      communication: {
        messagesCount,
        announcementsCount,
      },
      academic: {
        tasksCreated,
        submissionsCount,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
      },
      payments: {
        chargesTotal: chargesStats._sum.amount || 0,
        chargesCount: chargesStats._count,
        paymentsTotal: paymentsStats._sum.amount || 0,
        paymentsCount: paymentsStats._count,
        pendingTotal: pendingCharges._sum.amount || 0,
        pendingCount: pendingCharges._count,
        collectionRate: chargesStats._sum.amount 
          ? Math.round(((paymentsStats._sum.amount || 0) / chargesStats._sum.amount) * 100) 
          : 0,
      },
      chatbot: {
        totalQueries: chatbotStats,
        resolvedQueries: chatbotResolved,
        resolutionRate: chatbotStats > 0 ? Math.round((chatbotResolved / chatbotStats) * 100) : 0,
      },
      appointments: {
        scheduled: appointmentsScheduled,
        completed: appointmentsCompleted,
        completionRate: appointmentsScheduled > 0 
          ? Math.round((appointmentsCompleted / appointmentsScheduled) * 100) 
          : 0,
      },
      trends,
      period,
    };

    // Exportar si se solicita
    if (exportFormat === "csv") {
      const csv = generateMetricsCSV(metrics);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="metricas_${period}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function getWeeklyTrends(schoolId: string) {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [messages, tasks, payments] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: { schoolId },
          createdAt: { gte: date, lt: nextDate },
        },
      }),
      prisma.task.count({
        where: {
          group: { schoolId },
          createdAt: { gte: date, lt: nextDate },
        },
      }),
      prisma.payment.aggregate({
        where: {
          charge: { schoolId },
          paidAt: { gte: date, lt: nextDate },
        },
        _sum: { amount: true },
      }),
    ]);

    days.push({
      date: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("es-MX", { weekday: "short" }),
      messages,
      tasks,
      payments: payments._sum.amount || 0,
    });
  }

  return days;
}

function generateMetricsCSV(metrics: any): string {
  const lines = [
    "Métricas Escolares",
    `Período: ${metrics.period}`,
    `Fecha de generación: ${new Date().toLocaleDateString("es-MX")}`,
    "",
    "RESUMEN GENERAL",
    `Total Usuarios,${metrics.overview.totalUsers}`,
    `Total Alumnos,${metrics.overview.totalStudents}`,
    `Total Grupos,${metrics.overview.totalGroups}`,
    `Total Padres,${metrics.overview.totalParents}`,
    `Total Profesores,${metrics.overview.totalTeachers}`,
    "",
    "COMUNICACIÓN",
    `Mensajes enviados,${metrics.communication.messagesCount}`,
    `Anuncios publicados,${metrics.communication.announcementsCount}`,
    "",
    "ACADÉMICO",
    `Tareas creadas,${metrics.academic.tasksCreated}`,
    `Entregas realizadas,${metrics.academic.submissionsCount}`,
    `Promedio asistencia,${metrics.academic.averageAttendance}%`,
    "",
    "PAGOS",
    `Total cargos,$${metrics.payments.chargesTotal}`,
    `Total pagos recibidos,$${metrics.payments.paymentsTotal}`,
    `Saldo pendiente,$${metrics.payments.pendingTotal}`,
    `Tasa de cobranza,${metrics.payments.collectionRate}%`,
    "",
    "CHATBOT",
    `Consultas totales,${metrics.chatbot.totalQueries}`,
    `Consultas resueltas,${metrics.chatbot.resolvedQueries}`,
    `Tasa de resolución,${metrics.chatbot.resolutionRate}%`,
    "",
    "CITAS",
    `Citas agendadas,${metrics.appointments.scheduled}`,
    `Citas completadas,${metrics.appointments.completed}`,
    `Tasa de cumplimiento,${metrics.appointments.completionRate}%`,
    "",
    "TENDENCIAS (7 DÍAS)",
    "Fecha,Mensajes,Tareas,Pagos",
    ...metrics.trends.map((t: any) => `${t.date},${t.messages},${t.tasks},${t.payments}`),
  ];

  return lines.join("\n");
}
