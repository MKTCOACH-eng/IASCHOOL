import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Dashboard metrics for Super Admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Fetch all metrics in parallel
    const [
      totalSchools,
      activeSchools,
      totalUsers,
      totalStudents,
      totalTeachers,
      totalParents,
      recentSchools,
      schoolsWithStats
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.student.count(),
      prisma.user.count({ where: { role: "PROFESOR" } }),
      prisma.user.count({ where: { role: "PADRE" } }),
      prisma.school.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { users: true, students: true, groups: true }
          }
        }
      }),
      prisma.school.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: { 
              users: true, 
              students: true, 
              groups: true,
              announcements: true,
              documents: true
            }
          }
        }
      })
    ]);

    // Calculate growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [newSchoolsThisMonth, newSchoolsLastMonth, newUsersThisMonth] = await Promise.all([
      prisma.school.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.school.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, role: { not: "SUPER_ADMIN" } } })
    ]);

    const schoolGrowth = newSchoolsLastMonth > 0 
      ? Math.round(((newSchoolsThisMonth - newSchoolsLastMonth) / newSchoolsLastMonth) * 100)
      : newSchoolsThisMonth > 0 ? 100 : 0;

    return NextResponse.json({
      overview: {
        totalSchools,
        activeSchools,
        inactiveSchools: totalSchools - activeSchools,
        totalUsers,
        totalStudents,
        totalTeachers,
        totalParents,
        newSchoolsThisMonth,
        newUsersThisMonth,
        schoolGrowth
      },
      recentSchools,
      schoolsWithStats
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}
