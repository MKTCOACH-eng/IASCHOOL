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

// GET - List all campaigns
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

    const campaigns = await prisma.crmCampaign.findMany({
      where: { schoolId: user.schoolId! },
      include: {
        segment: { select: { name: true } },
        createdBy: { select: { name: true } },
        _count: { select: { recipients: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Error al obtener campañas" }, { status: 500 });
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, subject, content, segmentId, type, scheduledAt } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: "Nombre, asunto y contenido son requeridos" }, { status: 400 });
    }

    // Get recipient count
    let totalRecipients = 0;
    if (segmentId) {
      const segment = await prisma.crmSegment.findUnique({
        where: { id: segmentId }
      });
      totalRecipients = segment?.userCount || 0;
    } else {
      // All parents in school
      totalRecipients = await prisma.user.count({
        where: {
          schoolId: user.schoolId!,
          role: "PADRE"
        }
      });
    }

    const campaign = await prisma.crmCampaign.create({
      data: {
        schoolId: user.schoolId!,
        name,
        subject,
        content,
        segmentId,
        type: type || "EMAIL",
        status: "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalRecipients,
        createdById: user.id
      },
      include: {
        segment: { select: { name: true } },
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Error al crear campaña" }, { status: 500 });
  }
}
