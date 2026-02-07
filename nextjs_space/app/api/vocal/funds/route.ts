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

// GET - Listar colectas (para vocales y padres del grupo)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const status = searchParams.get("status");

    // Verificar si es vocal del grupo o padre con hijos en el grupo
    let groupIds: string[] = [];

    if (user.role === "VOCAL" || user.role === "PADRE") {
      // Obtener grupos donde el usuario es vocal
      const vocalGroups = await prisma.groupVocal.findMany({
        where: { userId: user.id, isActive: true },
        select: { groupId: true }
      });

      // Obtener grupos de los hijos del usuario
      const parentGroups = await prisma.student.findMany({
        where: {
          parents: { some: { id: user.id } },
          groupId: { not: null }
        },
        select: { groupId: true }
      });

      groupIds = [
        ...vocalGroups.map(g => g.groupId),
        ...parentGroups.map(g => g.groupId!)
      ];
      groupIds = [...new Set(groupIds)];
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      // Admins pueden ver todo de su escuela
      const allGroups = await prisma.group.findMany({
        where: { schoolId: user.schoolId, isActive: true },
        select: { id: true }
      });
      groupIds = allGroups.map(g => g.id);
    } else if (user.role === "PROFESOR") {
      // Profesores ven grupos que les asignaron
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: user.id, isActive: true },
        select: { id: true }
      });
      groupIds = teacherGroups.map(g => g.id);
    }

    if (groupId) {
      // Filtrar por grupo específico si se proporciona
      if (!groupIds.includes(groupId)) {
        return NextResponse.json({ error: "Sin acceso a este grupo" }, { status: 403 });
      }
      groupIds = [groupId];
    }

    const whereClause: Record<string, unknown> = {
      groupId: { in: groupIds }
    };

    if (status) {
      whereClause.status = status;
    }

    const funds = await prisma.groupFund.findMany({
      where: whereClause,
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        contributions: {
          select: { status: true, amount: true }
        },
        expenses: {
          select: { amount: true }
        },
        linkedEvent: { select: { id: true, title: true, startDate: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calcular estadísticas por colecta
    const fundsWithStats = funds.map(fund => {
      const paidCount = fund.contributions.filter(c => c.status === "PAID").length;
      const pendingCount = fund.contributions.filter(c => c.status === "PENDING").length;
      const totalCollected = fund.contributions
        .filter(c => c.status === "PAID")
        .reduce((sum, c) => sum + c.amount, 0);
      const totalExpenses = fund.expenses.reduce((sum, e) => sum + e.amount, 0);
      const balance = totalCollected - totalExpenses;

      return {
        ...fund,
        stats: {
          paidCount,
          pendingCount,
          totalContributions: fund.contributions.length,
          totalCollected,
          totalExpenses,
          balance
        },
        contributions: undefined,
        expenses: undefined
      };
    });

    return NextResponse.json(fundsWithStats);
  } catch (error) {
    console.error("Error fetching funds:", error);
    return NextResponse.json({ error: "Error al obtener colectas" }, { status: 500 });
  }
}

// POST - Crear nueva colecta (solo vocales)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Verificar que sea vocal o admin
    if (!["VOCAL", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo vocales pueden crear colectas" }, { status: 403 });
    }

    const body = await req.json();
    const { groupId, title, description, amountPerStudent, goalAmount, dueDate, eventDate, linkedEventId } = body;

    if (!groupId || !title || amountPerStudent === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que sea vocal del grupo (si no es admin)
    if (user.role === "VOCAL") {
      const isVocal = await prisma.groupVocal.findFirst({
        where: { groupId, userId: user.id, isActive: true }
      });
      if (!isVocal) {
        return NextResponse.json({ error: "No eres vocal de este grupo" }, { status: 403 });
      }
    }

    // Obtener estudiantes del grupo para crear contribuciones
    const students = await prisma.student.findMany({
      where: { groupId, isActive: true },
      select: { id: true }
    });

    // Crear colecta y contribuciones en transacción
    const fund = await prisma.$transaction(async (tx) => {
      const newFund = await tx.groupFund.create({
        data: {
          groupId,
          createdById: user.id,
          title,
          description,
          amountPerStudent: parseFloat(amountPerStudent),
          goalAmount: goalAmount ? parseFloat(goalAmount) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          eventDate: eventDate ? new Date(eventDate) : null,
          linkedEventId: linkedEventId || null
        }
      });

      // Crear contribuciones pendientes para cada estudiante
      if (students.length > 0) {
        await tx.groupFundContribution.createMany({
          data: students.map(s => ({
            fundId: newFund.id,
            studentId: s.id,
            amount: parseFloat(amountPerStudent),
            status: "PENDING"
          }))
        });
      }

      return newFund;
    });

    return NextResponse.json(fund, { status: 201 });
  } catch (error) {
    console.error("Error creating fund:", error);
    return NextResponse.json({ error: "Error al crear colecta" }, { status: 500 });
  }
}
