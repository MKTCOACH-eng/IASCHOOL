import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener configuración del programa de referidos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    let program = await prisma.schoolReferralProgram.findUnique({
      where: { schoolId: user.schoolId },
      include: {
        _count: {
          select: {
            referrals: true,
            rewards: true,
          },
        },
      },
    });

    // Si no existe, retornar configuración por defecto
    if (!program) {
      return NextResponse.json({
        program: null,
        isConfigured: false,
        defaults: {
          rewardType: "DISCOUNT_PERCENTAGE",
          rewardValue: 10,
          maxRewardsPerYear: 5,
          requiresActiveAccount: true,
          requiresMinMonths: 3,
        },
      });
    }

    return NextResponse.json({
      program,
      isConfigured: true,
    });
  } catch (error) {
    console.error("Error fetching referral config:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar configuración del programa
export async function POST(request: Request) {
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
    const {
      isActive,
      rewardType,
      rewardValue,
      rewardDescription,
      maxRewardsPerYear,
      minEnrollmentValue,
      requiresActiveAccount,
      requiresMinMonths,
      welcomeMessage,
      thankYouMessage,
      termsUrl,
    } = body;

    // Validar campos requeridos
    if (rewardValue <= 0) {
      return NextResponse.json(
        { error: "El valor de la recompensa debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const program = await prisma.schoolReferralProgram.upsert({
      where: { schoolId: user.schoolId },
      update: {
        isActive: isActive ?? true,
        rewardType: rewardType || "DISCOUNT_PERCENTAGE",
        rewardValue: rewardValue || 10,
        rewardDescription,
        maxRewardsPerYear: maxRewardsPerYear || 5,
        minEnrollmentValue: minEnrollmentValue || 0,
        requiresActiveAccount: requiresActiveAccount ?? true,
        requiresMinMonths: requiresMinMonths || 3,
        welcomeMessage,
        thankYouMessage,
        termsUrl,
      },
      create: {
        schoolId: user.schoolId,
        isActive: isActive ?? true,
        rewardType: rewardType || "DISCOUNT_PERCENTAGE",
        rewardValue: rewardValue || 10,
        rewardDescription,
        maxRewardsPerYear: maxRewardsPerYear || 5,
        minEnrollmentValue: minEnrollmentValue || 0,
        requiresActiveAccount: requiresActiveAccount ?? true,
        requiresMinMonths: requiresMinMonths || 3,
        welcomeMessage,
        thankYouMessage,
        termsUrl,
      },
    });

    return NextResponse.json({
      success: true,
      program,
    });
  } catch (error) {
    console.error("Error saving referral config:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}
