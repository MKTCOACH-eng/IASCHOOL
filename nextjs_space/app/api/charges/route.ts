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

// GET - List charges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build where clause based on role
    let where: any = { schoolId: user.schoolId };

    // Admins can see all charges
    // Parents can only see charges for their children
    if (user.role === "PADRE") {
      const userWithChildren = await db.user.findUnique({
        where: { id: user.id },
        include: { children: { select: { id: true } } },
      });
      
      const childIds = userWithChildren?.children.map(c => c.id) || [];
      if (childIds.length === 0) {
        return NextResponse.json([]);
      }
      where.studentId = { in: childIds };
    }

    // Apply filters
    if (studentId) {
      where.studentId = studentId;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const charges = await db.charge.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            group: { select: { name: true } },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
          },
          orderBy: { paidAt: "desc" },
        },
        createdBy: { select: { name: true } },
        _count: { select: { payments: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json(charges);
  } catch (error) {
    console.error("Error fetching charges:", error);
    return NextResponse.json(
      { error: "Error al obtener cargos" },
      { status: 500 }
    );
  }
}

// POST - Create charge (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores pueden crear cargos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      concept,
      type,
      amount,
      dueDate,
      studentId,
      periodMonth,
      periodYear,
      notes,
    } = body;

    if (!concept || !amount || !dueDate || !studentId) {
      return NextResponse.json(
        { error: "Concepto, monto, fecha límite y estudiante son requeridos" },
        { status: 400 }
      );
    }

    // Verify student belongs to school
    const student = await db.student.findFirst({
      where: { id: studentId, schoolId: user.schoolId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    // Determine initial status based on due date
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    const status = dueDateObj < now ? "VENCIDO" : "PENDIENTE";

    const charge = await db.charge.create({
      data: {
        concept,
        type: type || "COLEGIATURA",
        amount: parseFloat(amount),
        dueDate: dueDateObj,
        status,
        studentId,
        schoolId: user.schoolId,
        createdById: user.id,
        periodMonth: periodMonth || null,
        periodYear: periodYear || null,
        notes: notes || null,
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

    return NextResponse.json(charge, { status: 201 });
  } catch (error) {
    console.error("Error creating charge:", error);
    return NextResponse.json(
      { error: "Error al crear cargo" },
      { status: 500 }
    );
  }
}
