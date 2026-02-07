import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST - Asignar beca a estudiantes
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un estudiante" },
        { status: 400 }
      );
    }

    // Verificar que la beca existe y pertenece a la escuela
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        id: params.id,
        schoolId: user.schoolId,
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!scholarship) {
      return NextResponse.json({ error: "Beca no encontrada" }, { status: 404 });
    }

    // Verificar límite de beneficiarios
    if (
      scholarship.maxBeneficiaries &&
      scholarship._count.students + studentIds.length > scholarship.maxBeneficiaries
    ) {
      return NextResponse.json(
        {
          error: `Esta beca tiene un límite de ${scholarship.maxBeneficiaries} beneficiarios. Actualmente hay ${scholarship._count.students}.`,
        },
        { status: 400 }
      );
    }

    // Verificar que los estudiantes existen y pertenecen a la escuela
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId: user.schoolId,
        isActive: true,
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Algunos estudiantes no son válidos" },
        { status: 400 }
      );
    }

    // Obtener estudiantes que ya tienen esta beca
    const existingAssignments = await prisma.studentScholarship.findMany({
      where: {
        scholarshipId: params.id,
        studentId: { in: studentIds },
      },
    });

    const existingStudentIds = existingAssignments.map((a) => a.studentId);
    const newStudentIds = studentIds.filter(
      (id: string) => !existingStudentIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        { error: "Todos los estudiantes seleccionados ya tienen esta beca" },
        { status: 400 }
      );
    }

    // Crear asignaciones
    const assignments = await prisma.studentScholarship.createMany({
      data: newStudentIds.map((studentId: string) => ({
        studentId,
        scholarshipId: params.id,
        status: "ACTIVA" as const,
        customDiscountValue: null,
        validFrom: new Date(),
      })),
    });

    return NextResponse.json({
      message: "Beca asignada exitosamente",
      assigned: assignments.count,
      skipped: existingStudentIds.length,
    });
  } catch (error) {
    console.error("Error assigning scholarship:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
