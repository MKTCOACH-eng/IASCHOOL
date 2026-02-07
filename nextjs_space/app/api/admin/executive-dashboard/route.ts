import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const schoolId = user.schoolId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Parallel queries for performance
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalParents,
      totalGroups,
      // Attendance this month
      attendanceThisMonth,
      totalAttendanceRecords,
      // Payments
      totalCharges,
      paidCharges,
      pendingCharges,
      paymentsThisMonth,
      paymentsLastMonth,
      // Messages
      messagesThisMonth,
      messagesLastMonth,
      // Tasks
      totalTasks,
      completedSubmissions,
      // Surveys/NPS
      latestNPS,
      // Enrollments
      pendingEnrollments,
      // Recent activity
      recentAnnouncements,
      recentEvents
    ] = await Promise.all([
      // Students
      db.student.count({ where: { schoolId } }),
      db.student.count({ where: { schoolId, isActive: true } }),
      // Teachers
      db.user.count({ where: { schoolId, role: 'PROFESOR' } }),
      // Parents
      db.user.count({ where: { schoolId, role: 'PADRE' } }),
      // Groups
      db.group.count({ where: { schoolId, isActive: true } }),
      // Attendance
      db.attendance.count({
        where: {
          date: { gte: startOfMonth },
          status: 'PRESENTE',
          student: { schoolId }
        }
      }),
      db.attendance.count({
        where: {
          date: { gte: startOfMonth },
          student: { schoolId }
        }
      }),
      // Charges totals
      db.charge.aggregate({
        where: { schoolId },
        _sum: { amount: true }
      }),
      db.charge.aggregate({
        where: { schoolId, status: 'PAGADO' },
        _sum: { amount: true }
      }),
      db.charge.aggregate({
        where: { schoolId, status: { in: ['PENDIENTE', 'VENCIDO'] } },
        _sum: { amount: true }
      }),
      // Payments this month
      db.payment.aggregate({
        where: {
          paidAt: { gte: startOfMonth },
          charge: { schoolId }
        },
        _sum: { amount: true }
      }),
      // Payments last month
      db.payment.aggregate({
        where: {
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          charge: { schoolId }
        },
        _sum: { amount: true }
      }),
      // Messages this month
      db.message.count({
        where: {
          createdAt: { gte: startOfMonth },
          conversation: { schoolId }
        }
      }),
      // Messages last month
      db.message.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          conversation: { schoolId }
        }
      }),
      // Tasks
      db.task.count({
        where: { 
          group: { schoolId },
          status: 'PUBLISHED'
        }
      }),
      db.submission.count({
        where: {
          task: { group: { schoolId } },
          status: 'REVIEWED'
        }
      }),
      // Latest NPS Survey
      db.survey.findFirst({
        where: { schoolId, type: 'NPS', status: 'CLOSED' },
        orderBy: { createdAt: 'desc' },
        select: { averageScore: true, responseCount: true, title: true }
      }),
      // Pending enrollments
      db.enrollment.count({
        where: { schoolId, status: { in: ['PENDING', 'REVIEWING'] } }
      }),
      // Recent announcements
      db.announcement.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          priority: true,
          createdAt: true,
          _count: { select: { reads: true } }
        }
      }),
      // Upcoming events
      db.event.findMany({
        where: { schoolId, startDate: { gte: now } },
        orderBy: { startDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          startDate: true,
          type: true
        }
      })
    ]);
    
    // Calculate metrics
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((attendanceThisMonth / totalAttendanceRecords) * 100) 
      : 0;
    
    const totalRevenue = totalCharges._sum?.amount || 0;
    const collectedRevenue = paidCharges._sum?.amount || 0;
    const pendingRevenue = pendingCharges._sum?.amount || 0;
    const collectionRate = totalRevenue > 0 
      ? Math.round((collectedRevenue / totalRevenue) * 100) 
      : 0;
    
    const revenueThisMonth = paymentsThisMonth._sum.amount || 0;
    const revenueLastMonth = paymentsLastMonth._sum.amount || 0;
    const revenueGrowth = revenueLastMonth > 0 
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) 
      : 0;
    
    const messageGrowth = messagesLastMonth > 0 
      ? Math.round(((messagesThisMonth - messagesLastMonth) / messagesLastMonth) * 100) 
      : 0;
    
    // NPS calculation (if exists)
    let npsScore = null;
    let npsCategory = null;
    if (latestNPS?.averageScore !== null && latestNPS?.averageScore !== undefined) {
      npsScore = Math.round(latestNPS.averageScore);
      if (npsScore >= 9) npsCategory = 'Promotor';
      else if (npsScore >= 7) npsCategory = 'Neutral';
      else npsCategory = 'Detractor';
    }
    
    return NextResponse.json({
      // Overview
      overview: {
        totalStudents: activeStudents,
        totalTeachers,
        totalParents,
        totalGroups,
        attendanceRate,
        collectionRate
      },
      // Financial
      financial: {
        totalRevenue,
        collectedRevenue,
        pendingRevenue,
        revenueThisMonth,
        revenueLastMonth,
        revenueGrowth
      },
      // Engagement
      engagement: {
        messagesThisMonth,
        messagesLastMonth,
        messageGrowth,
        totalTasks,
        completedSubmissions
      },
      // NPS
      nps: {
        score: npsScore,
        category: npsCategory,
        responses: latestNPS?.responseCount || 0,
        surveyTitle: latestNPS?.title
      },
      // Pipeline
      pipeline: {
        pendingEnrollments
      },
      // Recent
      recentAnnouncements,
      upcomingEvents: recentEvents
    });
    
  } catch (error) {
    console.error("Error fetching executive dashboard:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
