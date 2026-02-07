import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: { id: string };
}

// GET - Listar becas de un estudiante
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = params.id;

    // Verificar acceso al estudiante
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { select: { id: true } },
      },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Padres pueden ver becas de sus hijos
    // Admin con CAJA o DIRECCION pueden ver todas
    const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
    const adminSubRoles = user.adminSubRoles || [];
    const isAuthorizedAdmin = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("CAJA") ||
      adminSubRoles.includes("DIRECCION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!isParent && !isAuthorizedAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const studentScholarships = await prisma.studentScholarship.findMany({
      where: { studentId },
      include: {
        scholarship: true,
      },
      orderBy: { validFrom: "desc" },
    });

    return NextResponse.json(studentScholarships);
  } catch (error) {
    console.error("Error fetching student scholarships:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Asignar beca a estudiante (solo ADMIN con CAJA o DIRECCION)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = params.id;

    // Solo CAJA o DIRECCION pueden asignar becas
    const adminSubRoles = user.adminSubRoles || [];
    const canAssignScholarships = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("CAJA") ||
      adminSubRoles.includes("DIRECCION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!canAssignScholarships) {
      return NextResponse.json(
        { error: "Solo Dirección o Caja pueden asignar becas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      scholarshipId,
      customDiscountValue,
      validFrom,
      validUntil,
      supportingDocUrl,
      notes,
    } = body;

    if (!scholarshipId || !validFrom) {
      return NextResponse.json(
        { error: "Beca y fecha de inicio son requeridas" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la beca existe y está activa
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship || scholarship.schoolId !== user.schoolId) {
      return NextResponse.json(
        { error: "Beca no encontrada" },
        { status: 404 }
      );
    }

    if (!scholarship.isActive) {
      return NextResponse.json(
        { error: "Esta beca no está activa" },
        { status: 400 }
      );
    }

    // Verificar si el estudiante ya tiene esta beca
    const existingAssignment = await prisma.studentScholarship.findUnique({
      where: {
        studentId_scholarshipId: {
          studentId,
          scholarshipId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "El estudiante ya tiene asignada esta beca" },
        { status: 400 }
      );
    }

    // Verificar límite de beneficiarios
    if (scholarship.maxBeneficiaries) {
      const currentCount = await prisma.studentScholarship.count({
        where: {
          scholarshipId,
          status: "ACTIVA",
        },
      });

      if (currentCount >= scholarship.maxBeneficiaries) {
        return NextResponse.json(
          { error: "Se ha alcanzado el límite de beneficiarios para esta beca" },
          { status: 400 }
        );
      }
    }

    const studentScholarship = await prisma.studentScholarship.create({
      data: {
        studentId,
        scholarshipId,
        status: "ACTIVA",
        customDiscountValue: customDiscountValue || null,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        supportingDocUrl: supportingDocUrl || null,
        notes: notes || null,
        approvedAt: new Date(),
        approvedBy: user.id,
      },
      include: {
        scholarship: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Actualizar contador de beneficiarios
    await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: {
        currentBeneficiaries: { increment: 1 },
      },
    });

    return NextResponse.json(studentScholarship, { status: 201 });
  } catch (error) {
    console.error("Error assigning scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
