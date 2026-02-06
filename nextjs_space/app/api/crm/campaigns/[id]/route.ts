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

// GET - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;

    const campaign = await prisma.crmCampaign.findUnique({
      where: { id, schoolId: user.schoolId! },
      include: {
        segment: true,
        createdBy: { select: { name: true } },
        recipients: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 100
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Error al obtener campaña" }, { status: 500 });
  }
}

// POST - Send campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;

    const campaign = await prisma.crmCampaign.findUnique({
      where: { id, schoolId: user.schoolId! },
      include: { segment: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json({ error: "La campaña ya fue enviada" }, { status: 400 });
    }

    // Get recipients based on segment or all parents
    let recipients: { id: string; email: string }[] = [];
    
    if (campaign.segmentId && campaign.segment) {
      const filters = campaign.segment.filters as any;
      const whereClause: any = { schoolId: user.schoolId! };

      if (filters?.roles?.length > 0) {
        whereClause.role = { in: filters.roles };
      } else {
        whereClause.role = "PADRE";
      }

      if (filters?.groupId) {
        const students = await prisma.student.findMany({
          where: { groupId: filters.groupId },
          include: { parents: { select: { id: true } } }
        });
        const parentIds = students.flatMap((s: any) => s.parents.map((p: any) => p.id));
        whereClause.id = { in: parentIds };
      }

      recipients = await prisma.user.findMany({
        where: whereClause,
        select: { id: true, email: true }
      });
    } else {
      // All parents
      recipients = await prisma.user.findMany({
        where: {
          schoolId: user.schoolId!,
          role: "PADRE"
        },
        select: { id: true, email: true }
      });
    }

    // Create recipient records
    const recipientData = recipients.map(r => ({
      campaignId: id,
      userId: r.id,
      email: r.email,
      status: "pending"
    }));

    await prisma.crmCampaignRecipient.createMany({
      data: recipientData,
      skipDuplicates: true
    });

    // Update campaign status
    const updatedCampaign = await prisma.crmCampaign.update({
      where: { id },
      data: {
        status: "SENDING",
        totalRecipients: recipients.length
      }
    });

    // Simulate email sending (in production, this would be an async queue)
    // For now, we'll mark as sent after a small delay
    setTimeout(async () => {
      try {
        await prisma.crmCampaignRecipient.updateMany({
          where: { campaignId: id },
          data: { status: "sent", sentAt: new Date() }
        });

        await prisma.crmCampaign.update({
          where: { id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            deliveredCount: recipients.length
          }
        });
      } catch (e) {
        console.error("Error updating campaign status:", e);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: `Campaña enviada a ${recipients.length} destinatarios`,
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    return NextResponse.json({ error: "Error al enviar campaña" }, { status: 500 });
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;

    const campaign = await prisma.crmCampaign.findUnique({
      where: { id, schoolId: user.schoolId! }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json({ error: "Solo se pueden eliminar campañas en borrador" }, { status: 400 });
    }

    await prisma.crmCampaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Error al eliminar campaña" }, { status: 500 });
  }
}
