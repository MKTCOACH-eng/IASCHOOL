import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { Student, Group, Task, Subject, Submission, Attendance, Announcement, User, Event, Charge } from "@prisma/client";

type ChildWithGroup = Student & { group: Group | null };
type TaskWithSubmissions = Task & { subject: Subject | null; submissions: Submission[] };
type AnnouncementWithCreator = Announcement & { createdBy: { name: string } };
type EventWithGroup = Event & { group: { name: string } | null };
type ChargeWithStudent = Charge & { student: { firstName: string; lastName: string } };

// GET: Generate weekly summary for a parent
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    
    // Only parents can access their weekly summary
    if (user.role !== "PADRE") {
      return NextResponse.json({ error: "Solo disponible para padres" }, { status: 403 });
    }

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    // Get parent's children
    const parent = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        children: {
          where: { isActive: true },
          include: {
            group: true,
          },
        },
      },
    });

    if (!parent || parent.children.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          children: [],
          announcements: [],
          upcomingEvents: [],
          pendingPayments: [],
        },
      });
    }

    const childIds = parent.children.map((c: ChildWithGroup) => c.id);
    const groupIds = parent.children
      .filter((c: ChildWithGroup) => c.groupId)
      .map((c: ChildWithGroup) => c.groupId as string);

    // Fetch data for each child
    const childrenSummaries = await Promise.all(
      parent.children.map(async (child: ChildWithGroup) => {
        // Tasks summary
        const tasks: TaskWithSubmissions[] = child.groupId
          ? await prisma.task.findMany({
              where: {
                groupId: child.groupId,
                status: "PUBLISHED",
                OR: [
                  { createdAt: { gte: startDate } },
                  { dueDate: { gte: startDate, lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
                ],
              },
              include: {
                subject: true,
                submissions: {
                  where: { studentId: child.id },
                },
              },
            })
          : [];

        const completedTasks = tasks.filter(
          (t: TaskWithSubmissions) => t.submissions.length > 0 && t.submissions[0].status !== "PENDING"
        );
        const pendingTasks = tasks.filter(
          (t: TaskWithSubmissions) => t.submissions.length === 0 || t.submissions[0].status === "PENDING"
        );
        const overdueTasks = pendingTasks.filter(
          (t: TaskWithSubmissions) => t.dueDate && new Date(t.dueDate) < endDate
        );

        // Attendance summary
        const attendances = await prisma.attendance.findMany({
          where: {
            studentId: child.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const attendanceSummary = {
          total: attendances.length,
          present: attendances.filter((a: Attendance) => a.status === "PRESENTE").length,
          absent: attendances.filter((a: Attendance) => a.status === "AUSENTE").length,
          late: attendances.filter((a: Attendance) => a.status === "TARDANZA").length,
          justified: attendances.filter((a: Attendance) => a.status === "JUSTIFICADO").length,
        };

        // Recent grades
        const recentSubmissions = await prisma.submission.findMany({
          where: {
            studentId: child.id,
            reviewedAt: {
              gte: startDate,
            },
            score: { not: null },
          },
          include: {
            task: {
              include: { subject: true },
            },
          },
          orderBy: { reviewedAt: "desc" },
          take: 5,
        });

        const grades = recentSubmissions.map((s: Submission & { task: Task & { subject: Subject | null } }) => ({
          taskTitle: s.task.title,
          subject: s.task.subject?.name || "Sin materia",
          score: s.score,
          maxScore: s.task.maxScore,
          reviewedAt: s.reviewedAt,
        }));

        const avgScore =
          grades.length > 0
            ? grades.reduce((sum: number, g: { score: number | null; maxScore: number }) => sum + ((g.score || 0) / g.maxScore) * 100, 0) /
              grades.length
            : null;

        return {
          id: child.id,
          name: `${child.firstName} ${child.lastName}`,
          group: child.group?.name || "Sin grupo",
          tasks: {
            total: tasks.length,
            completed: completedTasks.length,
            pending: pendingTasks.length,
            overdue: overdueTasks.length,
            upcoming: pendingTasks
              .filter((t: TaskWithSubmissions) => t.dueDate && new Date(t.dueDate) >= endDate)
              .slice(0, 3)
              .map((t: TaskWithSubmissions) => ({
                title: t.title,
                subject: t.subject?.name || "Sin materia",
                dueDate: t.dueDate,
              })),
          },
          attendance: attendanceSummary,
          grades: {
            recent: grades,
            averageScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
          },
        };
      })
    );

    // Recent announcements
    const announcements: AnnouncementWithCreator[] = await prisma.announcement.findMany({
      where: {
        schoolId: user.schoolId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Upcoming events (next 14 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    const upcomingEvents: EventWithGroup[] = await prisma.event.findMany({
      where: {
        OR: [
          { schoolId: user.schoolId, isPublic: true },
          { groupId: { in: groupIds } },
        ],
        startDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      orderBy: { startDate: "asc" },
      take: 10,
      include: {
        group: { select: { name: true } },
      },
    });

    // Pending payments
    const pendingPayments: ChargeWithStudent[] = await prisma.charge.findMany({
      where: {
        studentId: { in: childIds },
        status: { in: ["PENDIENTE", "VENCIDO", "PARCIAL"] },
      },
      include: {
        student: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const totalPending = pendingPayments.reduce(
      (sum: number, p: ChargeWithStudent) => sum + (p.amount - p.amountPaid),
      0
    );

    // Build summary response
    const summary = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      children: childrenSummaries,
      announcements: announcements.map((a: AnnouncementWithCreator) => ({
        id: a.id,
        title: a.title,
        content: a.content.substring(0, 200) + (a.content.length > 200 ? "..." : ""),
        priority: a.priority,
        createdAt: a.createdAt,
        author: a.createdBy.name,
      })),
      upcomingEvents: upcomingEvents.map((e: EventWithGroup) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
        group: e.group?.name || null,
        allDay: e.allDay,
      })),
      pendingPayments: {
        total: totalPending,
        count: pendingPayments.length,
        items: pendingPayments.map((p: ChargeWithStudent) => ({
          id: p.id,
          concept: p.concept,
          type: p.type,
          amount: p.amount,
          amountPaid: p.amountPaid,
          remaining: p.amount - p.amountPaid,
          dueDate: p.dueDate,
          status: p.status,
          studentName: `${p.student.firstName} ${p.student.lastName}`,
        })),
      },
    };

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return NextResponse.json(
      { error: "Error al generar resumen semanal" },
      { status: 500 }
    );
  }
}
