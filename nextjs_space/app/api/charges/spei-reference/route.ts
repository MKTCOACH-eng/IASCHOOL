import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// Genera una referencia única para el alumno
async function generateUniqueReference(schoolId: string, prefix: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Contar referencias existentes para generar secuencial
  const count = await prisma.speiReference.count({
    where: { schoolId },
  });
  
  // Formato: PREFIX + AÑO + SECUENCIAL (ej: VS240001)
  const sequential = (count + 1).toString().padStart(4, "0");
  return `${prefix}${year}${sequential}`;
}

// GET - Obtener referencia SPEI de un alumno
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Se requiere studentId" }, { status: 400 });
    }

    // Verificar acceso al estudiante
    if (user.role === "PADRE") {
      const parent = await prisma.user.findUnique({
        where: { id: user.id },
        include: { children: { select: { id: true } } },
      });
      const childIds = parent?.children.map(c => c.id) || [];
      if (!childIds.includes(studentId)) {
        return NextResponse.json({ error: "No tienes acceso a este estudiante" }, { status: 403 });
      }
    }

    // Obtener configuración bancaria
    const bankConfig = await prisma.schoolBankConfig.findUnique({
      where: { schoolId: user.schoolId },
    });

    if (!bankConfig) {
      return NextResponse.json({ 
        error: "La escuela no tiene configurados datos bancarios para SPEI",
        bankConfigMissing: true 
      }, { status: 404 });
    }

    // Buscar o crear referencia SPEI
    let speiRef = await prisma.speiReference.findUnique({
      where: { studentId },
      include: {
        student: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!speiRef) {
      // Generar nueva referencia
      const reference = await generateUniqueReference(user.schoolId, bankConfig.referencePrefix);
      
      speiRef = await prisma.speiReference.create({
        data: {
          studentId,
          schoolId: user.schoolId,
          reference,
        },
        include: {
          student: {
            select: { firstName: true, lastName: true },
          },
        },
      });
    }

    return NextResponse.json({
      reference: speiRef.reference,
      student: speiRef.student,
      bankInfo: {
        bankName: bankConfig.bankName,
        accountHolder: bankConfig.accountHolder,
        clabe: bankConfig.clabe,
        accountNumber: bankConfig.accountNumber,
      },
    });
  } catch (error) {
    console.error("Error getting SPEI reference:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Buscar alumno por referencia SPEI (para validar pagos)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden buscar por referencia" }, { status: 403 });
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: "Se requiere referencia" }, { status: 400 });
    }

    const speiRef = await prisma.speiReference.findUnique({
      where: { reference: reference.toUpperCase() },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            group: { select: { name: true } },
            charges: {
              where: { status: { in: ["PENDIENTE", "PARCIAL"] } },
              select: {
                id: true,
                concept: true,
                amount: true,
                amountPaid: true,
                dueDate: true,
                type: true,
              },
              orderBy: { dueDate: "asc" },
            },
          },
        },
      },
    });

    if (!speiRef) {
      return NextResponse.json({ error: "Referencia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      reference: speiRef.reference,
      student: speiRef.student,
      pendingCharges: speiRef.student.charges,
    });
  } catch (error) {
    console.error("Error searching by reference:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
