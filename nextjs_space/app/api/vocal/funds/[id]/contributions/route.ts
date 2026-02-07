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

// PUT - Registrar pago de contribución
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const fundId = params.id;

    const fund = await prisma.groupFund.findUnique({
      where: { id: fundId }
    });

    if (!fund) {
      return NextResponse.json({ error: "Colecta no encontrada" }, { status: 404 });
    }

    // Verificar que sea vocal del grupo o admin
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: fund.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo vocales pueden registrar pagos" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, status, paymentMethod, paymentReference, notes, amount } = body;

    if (!studentId || !status) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Actualizar o crear contribución
    const contribution = await prisma.groupFundContribution.upsert({
      where: {
        fundId_studentId: {
          fundId,
          studentId
        }
      },
      update: {
        status,
        amount: amount !== undefined ? parseFloat(amount) : fund.amountPerStudent,
        paymentMethod: status === "PAID" ? paymentMethod : null,
        paymentReference: status === "PAID" ? paymentReference : null,
        paidAt: status === "PAID" ? new Date() : null,
        recordedById: status === "PAID" ? user.id : null,
        notes
      },
      create: {
        fundId,
        studentId,
        amount: amount !== undefined ? parseFloat(amount) : fund.amountPerStudent,
        status,
        paymentMethod: status === "PAID" ? paymentMethod : null,
        paymentReference: status === "PAID" ? paymentReference : null,
        paidAt: status === "PAID" ? new Date() : null,
        recordedById: status === "PAID" ? user.id : null,
        notes
      }
    });

    // Actualizar total recaudado en el fondo
    const totalCollected = await prisma.groupFundContribution.aggregate({
      where: { fundId, status: "PAID" },
      _sum: { amount: true }
    });

    await prisma.groupFund.update({
      where: { id: fundId },
      data: { totalCollected: totalCollected._sum.amount || 0 }
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}

// POST - Registrar múltiples pagos a la vez
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const fundId = params.id;

    const fund = await prisma.groupFund.findUnique({
      where: { id: fundId }
    });

    if (!fund) {
      return NextResponse.json({ error: "Colecta no encontrada" }, { status: 404 });
    }

    // Verificar que sea vocal del grupo o admin
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: fund.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo vocales pueden registrar pagos" }, { status: 403 });
    }

    const body = await req.json();
    const { payments } = body; // Array de { studentId, status, paymentMethod, amount }

    if (!Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({ error: "Se requiere array de pagos" }, { status: 400 });
    }

    // Procesar pagos en transacción
    await prisma.$transaction(async (tx) => {
      for (const payment of payments) {
        await tx.groupFundContribution.upsert({
          where: {
            fundId_studentId: {
              fundId,
              studentId: payment.studentId
            }
          },
          update: {
            status: payment.status,
            amount: payment.amount !== undefined ? parseFloat(payment.amount) : fund.amountPerStudent,
            paymentMethod: payment.status === "PAID" ? payment.paymentMethod : null,
            paidAt: payment.status === "PAID" ? new Date() : null,
            recordedById: payment.status === "PAID" ? user.id : null
          },
          create: {
            fundId,
            studentId: payment.studentId,
            amount: payment.amount !== undefined ? parseFloat(payment.amount) : fund.amountPerStudent,
            status: payment.status,
            paymentMethod: payment.status === "PAID" ? payment.paymentMethod : null,
            paidAt: payment.status === "PAID" ? new Date() : null,
            recordedById: payment.status === "PAID" ? user.id : null
          }
        });
      }

      // Actualizar total recaudado
      const totalCollected = await tx.groupFundContribution.aggregate({
        where: { fundId, status: "PAID" },
        _sum: { amount: true }
      });

      await tx.groupFund.update({
        where: { id: fundId },
        data: { totalCollected: totalCollected._sum.amount || 0 }
      });
    });

    return NextResponse.json({ success: true, count: payments.length });
  } catch (error) {
    console.error("Error batch updating contributions:", error);
    return NextResponse.json({ error: "Error al registrar pagos" }, { status: 500 });
  }
}
