import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: { id: string };
}

// GET - Obtener detalle de beca
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = params;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                group: { select: { name: true } },
              },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!scholarship || scholarship.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Beca no encontrada" }, { status: 404 });
    }

    return NextResponse.json(scholarship);
  } catch (error) {
    console.error("Error fetching scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar beca
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = params;

    // Verificar permisos
    const adminSubRoles = user.adminSubRoles || [];
    const canManageScholarships = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("DIRECCION") || 
      adminSubRoles.includes("CAJA") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!canManageScholarships) {
      return NextResponse.json(
        { error: "Sin permisos para modificar becas" },
        { status: 403 }
      );
    }

    const existing = await prisma.scholarship.findUnique({ where: { id } });
    if (!existing || existing.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Beca no encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        applyTo: body.applyTo,
        minGPA: body.minGPA,
        requirements: body.requirements,
        maxBeneficiaries: body.maxBeneficiaries,
        isActive: body.isActive,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
    });

    return NextResponse.json(scholarship);
  } catch (error) {
    console.error("Error updating scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar beca
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = params;

    const adminSubRoles = user.adminSubRoles || [];
    const canManageScholarships = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("DIRECCION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!canManageScholarships) {
      return NextResponse.json(
        { error: "Solo Dirección puede eliminar becas" },
        { status: 403 }
      );
    }

    const existing = await prisma.scholarship.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!existing || existing.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Beca no encontrada" }, { status: 404 });
    }

    if (existing._count.students > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una beca con estudiantes asignados" },
        { status: 400 }
      );
    }

    await prisma.scholarship.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
