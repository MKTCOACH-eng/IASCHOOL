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

// GET - Listar gastos de una colecta
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const fundId = params.id;

    const expenses = await prisma.groupExpense.findMany({
      where: { fundId },
      include: {
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { expenseDate: "desc" }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ expenses, total });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 });
  }
}

// POST - Registrar gasto
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
      return NextResponse.json({ error: "Solo vocales pueden registrar gastos" }, { status: 403 });
    }

    const body = await req.json();
    const { concept, amount, receiptUrl, receiptPath, expenseDate, notes } = body;

    if (!concept || amount === undefined) {
      return NextResponse.json({ error: "Concepto y monto son requeridos" }, { status: 400 });
    }

    const expense = await prisma.groupExpense.create({
      data: {
        fundId,
        createdById: user.id,
        concept,
        amount: parseFloat(amount),
        receiptUrl,
        receiptPath,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        notes
      },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Error al registrar gasto" }, { status: 500 });
  }
}

// DELETE - Eliminar gasto
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(req.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json({ error: "ID de gasto requerido" }, { status: 400 });
    }

    const expense = await prisma.groupExpense.findUnique({
      where: { id: expenseId },
      include: { fund: true }
    });

    if (!expense) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    // Verificar que sea vocal del grupo o admin
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: expense.fund.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permiso para eliminar" }, { status: 403 });
    }

    await prisma.groupExpense.delete({ where: { id: expenseId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Error al eliminar gasto" }, { status: 500 });
  }
}
