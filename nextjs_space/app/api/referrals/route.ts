import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import crypto from "crypto";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// Función para normalizar y hashear teléfono
function normalizeAndHashPhone(phone: string): string {
  // Remover espacios, guiones, paréntesis, +
  const normalized = phone.replace(/[\s\-\(\)\+]/g, "");
  // Tomar últimos 10 dígitos
  const last10 = normalized.slice(-10);
  // Hashear
  return crypto.createHash("sha256").update(last10).digest("hex");
}

// GET - Obtener programa de referidos y mis referidos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Obtener programa
    const program = await prisma.schoolReferralProgram.findUnique({
      where: { schoolId: user.schoolId },
    });

    if (!program || !program.isActive) {
      return NextResponse.json({
        available: false,
        message: "El programa de referidos no está disponible en este momento.",
      });
    }

    // Verificar elegibilidad del usuario
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        children: {
          include: {
            charges: {
              where: { status: "PENDIENTE" },
            },
          },
        },
      },
    });

    // Verificar cuenta activa (sin adeudos si se requiere)
    let isEligible = true;
    let eligibilityReason = "";

    if (program.requiresActiveAccount) {
      const hasPendingPayments = userData?.children.some(
        (child) => child.charges.length > 0
      );
      if (hasPendingPayments) {
        isEligible = false;
        eligibilityReason = "Tienes pagos pendientes. Ponte al corriente para participar.";
      }
    }

    // Verificar meses mínimos
    if (program.requiresMinMonths && userData) {
      const monthsInSchool = Math.floor(
        (Date.now() - new Date(userData.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      if (monthsInSchool < program.requiresMinMonths) {
        isEligible = false;
        eligibilityReason = `Debes tener al menos ${program.requiresMinMonths} meses en la escuela para participar.`;
      }
    }

    // Obtener mis referidos
    const myReferrals = await prisma.schoolReferral.findMany({
      where: {
        referrerId: user.id,
        schoolId: user.schoolId,
      },
      select: {
        id: true,
        referredName: true,
        referredChildName: true,
        status: true,
        createdAt: true,
        enrolledAt: true,
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
    });

    // Obtener recompensas del año actual
    const currentYear = new Date().getFullYear();
    const rewardsThisYear = await prisma.referralReward.count({
      where: {
        beneficiaryId: user.id,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });

    const remainingRewards = (program.maxRewardsPerYear || 5) - rewardsThisYear;

    return NextResponse.json({
      available: true,
      isEligible,
      eligibilityReason,
      program: {
        rewardType: program.rewardType,
        rewardValue: Number(program.rewardValue),
        rewardDescription: program.rewardDescription,
        welcomeMessage: program.welcomeMessage,
        termsUrl: program.termsUrl,
      },
      myReferrals,
      stats: {
        total: myReferrals.length,
        successful: myReferrals.filter((r) => r.status === "ENROLLED").length,
        pending: myReferrals.filter((r) => ["PENDING", "CONTACTED", "INTERESTED"].includes(r.status)).length,
        remainingRewards: Math.max(0, remainingRewards),
      },
    });
  } catch (error) {
    console.error("Error fetching referral program:", error);
    return NextResponse.json(
      { error: "Error al obtener programa" },
      { status: 500 }
    );
  }
}

// POST - Enviar un nuevo referido
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const {
      referredName,
      referredEmail,
      referredPhone,
      referredChildName,
      referredChildGrade,
      referredNotes,
    } = body;

    // Validaciones
    if (!referredName || !referredPhone) {
      return NextResponse.json(
        { error: "Nombre y teléfono son requeridos" },
        { status: 400 }
      );
    }

    // Verificar programa activo
    const program = await prisma.schoolReferralProgram.findUnique({
      where: { schoolId: user.schoolId },
    });

    if (!program || !program.isActive) {
      return NextResponse.json(
        { error: "El programa de referidos no está disponible" },
        { status: 400 }
      );
    }

    // Verificar elegibilidad (simplificado para POST)
    if (program.requiresActiveAccount) {
      const pendingCharges = await prisma.charge.count({
        where: {
          student: { parents: { some: { id: user.id } } },
          status: "PENDIENTE",
        },
      });
      if (pendingCharges > 0) {
        return NextResponse.json(
          { error: "No puedes referir mientras tengas pagos pendientes" },
          { status: 400 }
        );
      }
    }

    // Verificar límite de recompensas del año
    const currentYear = new Date().getFullYear();
    const rewardsThisYear = await prisma.referralReward.count({
      where: {
        beneficiaryId: user.id,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });

    if (program.maxRewardsPerYear && rewardsThisYear >= program.maxRewardsPerYear) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${program.maxRewardsPerYear} recompensas este año` },
        { status: 400 }
      );
    }

    // Generar hash del teléfono para detectar duplicados
    const phoneHash = normalizeAndHashPhone(referredPhone);

    // Verificar si ya fue referido
    const existingReferral = await prisma.schoolReferral.findUnique({
      where: {
        schoolId_phoneHash: {
          schoolId: user.schoolId,
          phoneHash,
        },
      },
      include: {
        referrer: {
          select: { name: true },
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        {
          error: "Esta persona ya fue referida por alguien más. ¡Recomiéndanos a alguien diferente!",
          alreadyReferred: true,
        },
        { status: 409 }
      );
    }

    // Crear el referido
    const referral = await prisma.schoolReferral.create({
      data: {
        programId: program.id,
        schoolId: user.schoolId,
        referrerId: user.id,
        referredName,
        referredEmail,
        referredPhone,
        referredChildName,
        referredChildGrade,
        referredNotes,
        phoneHash,
        status: "PENDING",
      },
    });

    // Incrementar contador total
    await prisma.schoolReferralProgram.update({
      where: { id: program.id },
      data: { totalReferrals: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "¡Referido enviado exitosamente! Te notificaremos cuando se inscriba.",
      referral: {
        id: referral.id,
        referredName: referral.referredName,
        status: referral.status,
        createdAt: referral.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Error al enviar referido" },
      { status: 500 }
    );
  }
}
