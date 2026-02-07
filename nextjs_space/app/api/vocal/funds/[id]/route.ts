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

// GET - Obtener detalle de colecta
export async function GET(
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
      where: { id: fundId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            students: {
              where: { isActive: true },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                parents: { select: { id: true, name: true, email: true } }
              }
            }
          }
        },
        createdBy: { select: { id: true, name: true } },
        contributions: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                parents: { select: { id: true, name: true, email: true } }
              }
            },
            recordedBy: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: "desc" }
        },
        expenses: {
          include: {
            createdBy: { select: { id: true, name: true } }
          },
          orderBy: { expenseDate: "desc" }
        },
        linkedEvent: { select: { id: true, title: true, startDate: true } }
      }
    });

    if (!fund) {
      return NextResponse.json({ error: "Colecta no encontrada" }, { status: 404 });
    }

    // Verificar acceso
    const hasAccess = await checkAccess(user, fund.groupId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Sin acceso a esta colecta" }, { status: 403 });
    }

    // Calcular estadísticas
    const paidContributions = fund.contributions.filter(c => c.status === "PAID");
    const pendingContributions = fund.contributions.filter(c => c.status === "PENDING");
    const totalCollected = paidContributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = fund.expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      ...fund,
      stats: {
        totalStudents: fund.group.students.length,
        paidCount: paidContributions.length,
        pendingCount: pendingContributions.length,
        totalCollected,
        totalExpenses,
        balance: totalCollected - totalExpenses,
        percentageCollected: fund.group.students.length > 0
          ? Math.round((paidContributions.length / fund.group.students.length) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error("Error fetching fund:", error);
    return NextResponse.json({ error: "Error al obtener colecta" }, { status: 500 });
  }
}

// PUT - Actualizar colecta
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
      return NextResponse.json({ error: "Sin permiso para modificar" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, amountPerStudent, goalAmount, dueDate, eventDate, status } = body;

    const updatedFund = await prisma.groupFund.update({
      where: { id: fundId },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        amountPerStudent: amountPerStudent !== undefined ? parseFloat(amountPerStudent) : undefined,
        goalAmount: goalAmount !== undefined ? (goalAmount ? parseFloat(goalAmount) : null) : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : undefined,
        status: status || undefined
      }
    });

    return NextResponse.json(updatedFund);
  } catch (error) {
    console.error("Error updating fund:", error);
    return NextResponse.json({ error: "Error al actualizar colecta" }, { status: 500 });
  }
}

// DELETE - Eliminar colecta (solo si no tiene pagos)
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
    const fundId = params.id;

    const fund = await prisma.groupFund.findUnique({
      where: { id: fundId },
      include: {
        contributions: { where: { status: "PAID" } }
      }
    });

    if (!fund) {
      return NextResponse.json({ error: "Colecta no encontrada" }, { status: 404 });
    }

    // Verificar que sea vocal del grupo o admin
    const isVocal = await prisma.groupVocal.findFirst({
      where: { groupId: fund.groupId, userId: user.id, isActive: true }
    });

    if (!isVocal && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permiso para eliminar" }, { status: 403 });
    }

    // No permitir eliminar si ya hay pagos
    if (fund.contributions.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una colecta con pagos registrados" },
        { status: 400 }
      );
    }

    await prisma.groupFund.delete({ where: { id: fundId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fund:", error);
    return NextResponse.json({ error: "Error al eliminar colecta" }, { status: 500 });
  }
}

async function checkAccess(user: SessionUser, groupId: string): Promise<boolean> {
  if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return true;
  }

  // Verificar si es vocal del grupo
  const isVocal = await prisma.groupVocal.findFirst({
    where: { groupId, userId: user.id, isActive: true }
  });
  if (isVocal) return true;

  // Verificar si tiene hijos en el grupo
  const hasChild = await prisma.student.findFirst({
    where: {
      groupId,
      parents: { some: { id: user.id } }
    }
  });
  if (hasChild) return true;

  // Verificar si es profesor del grupo
  const isTeacher = await prisma.group.findFirst({
    where: { id: groupId, teacherId: user.id }
  });
  if (isTeacher) return true;

  return false;
}
