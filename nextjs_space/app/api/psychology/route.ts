import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Listar registros psicoemocionales
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const alertLevel = searchParams.get("alertLevel");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Solo ADMIN con subrol PSICOLOGIA, DIRECCION, o COORDINACION
    const adminSubRoles = user.adminSubRoles || [];
    const canViewRecords = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("PSICOLOGIA") ||
      adminSubRoles.includes("DIRECCION") ||
      adminSubRoles.includes("COORDINACION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    // Profesores solo ven registros marcados como visibleToTeachers
    const isTeacher = user.role === "PROFESOR";

    if (!canViewRecords && !isTeacher) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const where: any = {
      schoolId: user.schoolId,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    if (alertLevel) {
      where.alertLevel = alertLevel;
    }

    // Profesores solo ven registros visibles para ellos
    if (isTeacher) {
      where.visibleToTeachers = true;
      where.isConfidential = false;
    }

    const records = await prisma.psychologicalRecord.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            group: { select: { name: true } },
          },
        },
        recordedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching psychological records:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear registro psicoemocional
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Solo psicólogo, dirección o coordinación pueden crear registros
    const adminSubRoles = user.adminSubRoles || [];
    const canCreateRecords = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("PSICOLOGIA") ||
      adminSubRoles.includes("DIRECCION") ||
      adminSubRoles.includes("COORDINACION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!canCreateRecords) {
      return NextResponse.json(
        { error: "Solo el área de psicología puede crear registros" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      studentId,
      type,
      alertLevel,
      date,
      duration,
      emotionalState,
      reason,
      description,
      observations,
      actionPlan,
      recommendations,
      followUpRequired,
      followUpDate,
      parentNotified,
      externalReferral,
      externalProvider,
      isConfidential,
      visibleToTeachers,
    } = body;

    if (!studentId || !type || !reason || !description) {
      return NextResponse.json(
        { error: "Estudiante, tipo, motivo y descripción son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante pertenece a la escuela
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    const record = await prisma.psychologicalRecord.create({
      data: {
        studentId,
        schoolId: user.schoolId,
        type,
        alertLevel: alertLevel || "BAJO",
        date: date ? new Date(date) : new Date(),
        duration: duration || null,
        emotionalState: emotionalState || null,
        reason,
        description,
        observations: observations || null,
        actionPlan: actionPlan || null,
        recommendations: recommendations || null,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        parentNotified: parentNotified || false,
        parentNotifiedAt: parentNotified ? new Date() : null,
        externalReferral: externalReferral || false,
        externalProvider: externalProvider || null,
        isConfidential: isConfidential !== false,
        visibleToTeachers: visibleToTeachers || false,
        recordedById: user.id,
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

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating psychological record:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
