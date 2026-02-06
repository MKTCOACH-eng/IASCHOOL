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

// GET - Obtener configuración bancaria de la escuela
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const bankConfig = await prisma.schoolBankConfig.findUnique({
      where: { schoolId: user.schoolId },
    });

    return NextResponse.json(bankConfig);
  } catch (error) {
    console.error("Error fetching bank config:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear/actualizar configuración bancaria (solo Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden configurar datos bancarios" }, { status: 403 });
    }

    const body = await request.json();
    const { bankName, accountHolder, clabe, accountNumber, referencePrefix } = body;

    // Validar CLABE (18 dígitos)
    if (!clabe || clabe.length !== 18 || !/^\d+$/.test(clabe)) {
      return NextResponse.json({ error: "CLABE inválida. Debe tener 18 dígitos" }, { status: 400 });
    }

    if (!bankName || !accountHolder) {
      return NextResponse.json({ error: "Nombre del banco y titular son requeridos" }, { status: 400 });
    }

    const bankConfig = await prisma.schoolBankConfig.upsert({
      where: { schoolId: user.schoolId },
      update: {
        bankName,
        accountHolder,
        clabe,
        accountNumber,
        referencePrefix: referencePrefix || "REF",
      },
      create: {
        schoolId: user.schoolId,
        bankName,
        accountHolder,
        clabe,
        accountNumber,
        referencePrefix: referencePrefix || "REF",
      },
    });

    return NextResponse.json(bankConfig);
  } catch (error) {
    console.error("Error saving bank config:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
