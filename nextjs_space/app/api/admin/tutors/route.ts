import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Listar tutores de un estudiante o todos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (studentId) {
      // Obtener tutores de un estudiante específico
      const tutors = await prisma.studentTutor.findMany({
        where: {
          studentId,
          student: { schoolId: user.schoolId },
        },
        include: {
          tutor: {
            select: { id: true, name: true, email: true, phone: true },
          },
          configuredBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ isPrimaryContact: "desc" }, { createdAt: "asc" }],
      });

      return NextResponse.json(tutors);
    } else {
      // Obtener estudiantes con múltiples tutores
      const studentsWithMultipleTutors = await prisma.student.findMany({
        where: {
          schoolId: user.schoolId,
          tutors: { some: {} },
        },
        include: {
          group: { select: { id: true, name: true } },
          tutors: {
            include: {
              tutor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });

      return NextResponse.json(studentsWithMultipleTutors);
    }
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Agregar tutor a un estudiante
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

    const body = await req.json();
    const {
      studentId,
      tutorId,
      relationship,
      relationshipDetail,
      isPrimaryContact,
      hasFullAccess,
      canViewGrades,
      canViewAttendance,
      canViewPayments,
      canMakePayments,
      canPickup,
      canCommunicate,
      canReceiveNotifications,
      canRequestPermissions,
      custodyType,
      custodyNotes,
    } = body;

    if (!studentId || !tutorId) {
      return NextResponse.json(
        { error: "Estudiante y tutor son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante pertenece a la escuela
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: user.schoolId },
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Verificar que el tutor existe y es padre
    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, schoolId: user.schoolId, role: "PADRE" },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor no encontrado o no es padre" }, { status: 404 });
    }

    // Verificar si ya existe la relación
    const existing = await prisma.studentTutor.findUnique({
      where: { studentId_tutorId: { studentId, tutorId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este tutor ya está asignado al estudiante" },
        { status: 400 }
      );
    }

    // Si es contacto principal, desmarcar otros
    if (isPrimaryContact) {
      await prisma.studentTutor.updateMany({
        where: { studentId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    const studentTutor = await prisma.studentTutor.create({
      data: {
        studentId,
        tutorId,
        relationship: relationship || "PARENT",
        relationshipDetail,
        isPrimaryContact: isPrimaryContact || false,
        hasFullAccess: hasFullAccess !== false,
        canViewGrades: canViewGrades !== false,
        canViewAttendance: canViewAttendance !== false,
        canViewPayments: canViewPayments !== false,
        canMakePayments: canMakePayments !== false,
        canPickup: canPickup !== false,
        canCommunicate: canCommunicate !== false,
        canReceiveNotifications: canReceiveNotifications !== false,
        canRequestPermissions: canRequestPermissions !== false,
        custodyType,
        custodyNotes,
        configuredById: user.id,
      },
      include: {
        tutor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(studentTutor, { status: 201 });
  } catch (error) {
    console.error("Error creating tutor relation:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
