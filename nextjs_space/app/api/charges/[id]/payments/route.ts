import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Get payments for a charge
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    // Verify charge exists and user has access
    const charge = await db.charge.findFirst({
      where: { id, schoolId: user.schoolId },
      include: {
        student: {
          include: { parents: { select: { id: true } } },
        },
      },
    });

    if (!charge) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    // Parents can only see payments for their children's charges
    if (user.role === "PADRE") {
      const isParent = charge.student.parents.some((p) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json(
          { error: "No autorizado" },
          { status: 403 }
        );
      }
    }

    const payments = await db.payment.findMany({
      where: { chargeId: id },
      include: {
        recordedBy: { select: { name: true } },
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

// POST - Record a payment (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores pueden registrar pagos" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, method, reference, notes, paidAt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Get the charge
    const charge = await db.charge.findFirst({
      where: { id, schoolId: user.schoolId },
    });

    if (!charge) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    // Calculate new amount paid
    const paymentAmount = parseFloat(amount);
    const newAmountPaid = charge.amountPaid + paymentAmount;
    
    // Determine new status
    let newStatus: PaymentStatus;
    if (newAmountPaid >= charge.amount) {
      newStatus = PaymentStatus.PAGADO;
    } else if (newAmountPaid > 0) {
      newStatus = PaymentStatus.PARCIAL;
    } else {
      newStatus = charge.status;
    }

    // Create payment and update charge in transaction
    const result = await db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount: paymentAmount,
          method: method || "EFECTIVO",
          reference: reference || null,
          notes: notes || null,
          chargeId: id,
          recordedById: user.id,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
        include: {
          recordedBy: { select: { name: true } },
        },
      });

      const updatedCharge = await tx.charge.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
      });

      return { payment, charge: updatedCharge };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
