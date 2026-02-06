import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string | null;
}

// GET - Get CRM statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const schoolId = user.schoolId!;

    // Get total contacts (parents)
    const totalContacts = await prisma.user.count({
      where: { schoolId, role: "PADRE" }
    });

    // Get total campaigns
    const totalCampaigns = await prisma.crmCampaign.count({
      where: { schoolId }
    });

    // Get campaigns by status
    const campaignsByStatus = await prisma.crmCampaign.groupBy({
      by: ["status"],
      where: { schoolId },
      _count: true
    });

    // Get total emails sent
    const sentCampaigns = await prisma.crmCampaign.aggregate({
      where: { schoolId, status: "SENT" },
      _sum: { deliveredCount: true, openedCount: true, clickedCount: true }
    });

    // Get recent campaigns
    const recentCampaigns = await prisma.crmCampaign.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        totalRecipients: true,
        deliveredCount: true,
        openedCount: true,
        sentAt: true,
        createdAt: true
      }
    });

    // Get segments count
    const totalSegments = await prisma.crmSegment.count({
      where: { schoolId, isActive: true }
    });

    // Get templates count
    const totalTemplates = await prisma.emailTemplate.count({
      where: { schoolId }
    });

    // Calculate open rate
    const totalDelivered = sentCampaigns._sum.deliveredCount || 0;
    const totalOpened = sentCampaigns._sum.openedCount || 0;
    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;

    // Get communication logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommunications = await prisma.communicationLog.count({
      where: {
        schoolId,
        sentAt: { gte: thirtyDaysAgo }
      }
    });

    return NextResponse.json({
      totalContacts,
      totalCampaigns,
      totalSegments,
      totalTemplates,
      emailsSent: totalDelivered,
      emailsOpened: totalOpened,
      openRate,
      recentCommunications,
      campaignsByStatus: campaignsByStatus.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentCampaigns
    });
  } catch (error) {
    console.error("Error fetching CRM stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
