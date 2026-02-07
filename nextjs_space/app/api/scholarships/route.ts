import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Listar tipos de becas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Solo ADMIN puede ver becas
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const scholarships = await prisma.scholarship.findMany({
      where: {
        schoolId: user.schoolId,
      },
      include: {
        _count: {
          select: { students: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scholarships);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear tipo de beca (solo ADMIN con subrol CAJA o DIRECCION)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Verificar subroles permitidos
    const adminSubRoles = user.adminSubRoles || [];
    const canManageScholarships = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("DIRECCION") || 
      adminSubRoles.includes("CAJA") ||
      adminSubRoles.length === 0; // Si no tiene subroles, es admin general

    if (!canManageScholarships) {
      return NextResponse.json(
        { error: "Solo Dirección o Caja pueden gestionar becas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      type,
      description,
      discountType,
      discountValue,
      applyTo,
      minGPA,
      requirements,
      maxBeneficiaries,
      validFrom,
      validUntil,
    } = body;

    if (!name || !type || discountValue === undefined) {
      return NextResponse.json(
        { error: "Nombre, tipo y valor de descuento son requeridos" },
        { status: 400 }
      );
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        schoolId: user.schoolId,
        name,
        type,
        description,
        discountType: discountType || "PERCENTAGE",
        discountValue,
        applyTo: applyTo || "COLEGIATURA",
        minGPA: minGPA || null,
        requirements,
        maxBeneficiaries: maxBeneficiaries || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        createdById: user.id,
      },
    });

    return NextResponse.json(scholarship, { status: 201 });
  } catch (error) {
    console.error("Error creating scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
