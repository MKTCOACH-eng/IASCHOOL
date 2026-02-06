import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Get single charge
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

    const charge = await db.charge.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            group: { select: { name: true } },
            parents: { select: { id: true, name: true, email: true } },
          },
        },
        payments: {
          include: {
            recordedBy: { select: { name: true } },
          },
          orderBy: { paidAt: "desc" },
        },
        createdBy: { select: { name: true } },
      },
    });

    if (!charge) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    // Parents can only see their children's charges
    if (user.role === "PADRE") {
      const isParent = charge.student.parents.some((p) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json(
          { error: "No autorizado" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(charge);
  } catch (error) {
    console.error("Error fetching charge:", error);
    return NextResponse.json(
      { error: "Error al obtener cargo" },
      { status: 500 }
    );
  }
}

// PUT - Update charge (Admin only)
export async function PUT(
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
        { error: "Solo administradores pueden editar cargos" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingCharge = await db.charge.findFirst({
      where: { id, schoolId: user.schoolId },
    });

    if (!existingCharge) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      concept,
      type,
      amount,
      dueDate,
      status,
      periodMonth,
      periodYear,
      notes,
    } = body;

    const charge = await db.charge.update({
      where: { id },
      data: {
        concept,
        type,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        periodMonth,
        periodYear,
        notes,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(charge);
  } catch (error) {
    console.error("Error updating charge:", error);
    return NextResponse.json(
      { error: "Error al actualizar cargo" },
      { status: 500 }
    );
  }
}

// DELETE - Delete charge (Admin only)
export async function DELETE(
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
        { error: "Solo administradores pueden eliminar cargos" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingCharge = await db.charge.findFirst({
      where: { id, schoolId: user.schoolId },
    });

    if (!existingCharge) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    await db.charge.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting charge:", error);
    return NextResponse.json(
      { error: "Error al eliminar cargo" },
      { status: 500 }
    );
  }
}
