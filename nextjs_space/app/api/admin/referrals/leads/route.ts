import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener lista de referidos (leads)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { schoolId: user.schoolId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [referrals, total] = await Promise.all([
      prisma.schoolReferral.findMany({
        where,
        include: {
          referrer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          processedBy: {
            select: { id: true, name: true },
          },
          reward: {
            select: {
              id: true,
              isApplied: true,
              rewardType: true,
              rewardValue: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.schoolReferral.count({ where }),
    ]);

    // Estadísticas rápidas
    const stats = await prisma.schoolReferral.groupBy({
      by: ["status"],
      where: { schoolId: user.schoolId },
      _count: { status: true },
    });

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {}),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado de un referido
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const { referralId, status, adminNotes } = body;

    if (!referralId || !status) {
      return NextResponse.json(
        { error: "Se requiere ID y estado" },
        { status: 400 }
      );
    }

    // Verificar que el referido pertenece a la escuela
    const referral = await prisma.schoolReferral.findFirst({
      where: {
        id: referralId,
        schoolId: user.schoolId,
      },
      include: {
        program: true,
        referrer: true,
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referido no encontrado" },
        { status: 404 }
      );
    }

    // Preparar actualización
    const updateData: any = {
      status,
      adminNotes,
      processedById: user.id,
      statusHistory: {
        ...(referral.statusHistory as object || {}),
        [new Date().toISOString()]: {
          from: referral.status,
          to: status,
          by: user.id,
        },
      },
    };

    // Si se marca como ENROLLED, crear recompensa
    if (status === "ENROLLED" && referral.status !== "ENROLLED") {
      updateData.enrolledAt = new Date();

      // Crear recompensa para el referidor
      await prisma.referralReward.create({
        data: {
          programId: referral.programId,
          referralId: referral.id,
          beneficiaryId: referral.referrerId,
          rewardType: referral.program.rewardType,
          rewardValue: referral.program.rewardValue,
          description: referral.program.rewardDescription,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        },
      });

      // Actualizar contadores del programa
      await prisma.schoolReferralProgram.update({
        where: { id: referral.programId },
        data: {
          successfulReferrals: { increment: 1 },
        },
      });
    }

    // Si se marca como CONTACTED
    if (status === "CONTACTED" && !referral.contactedAt) {
      updateData.contactedAt = new Date();
    }

    const updated = await prisma.schoolReferral.update({
      where: { id: referralId },
      data: updateData,
      include: {
        referrer: {
          select: { id: true, name: true, email: true },
        },
        reward: true,
      },
    });

    return NextResponse.json({
      success: true,
      referral: updated,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Error al actualizar lead" },
      { status: 500 }
    );
  }
}
