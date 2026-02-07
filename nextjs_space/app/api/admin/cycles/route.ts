import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Listar ciclos escolares
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

    const cycles = await prisma.schoolCycle.findMany({
      where: { schoolId: user.schoolId },
      include: {
        _count: {
          select: {
            enrollments: true,
            charges: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(cycles);
  } catch (error) {
    console.error("Error fetching cycles:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear ciclo escolar
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
      name,
      startDate,
      endDate,
      inscriptionStart,
      inscriptionEnd,
      classesStart,
      classesEnd,
      inscriptionFee,
      monthlyTuition,
      materialsFee,
      autoPromotionEnabled,
      promotionMinGPA,
    } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Nombre, fecha de inicio y fin son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que no exista un ciclo con el mismo nombre
    const existing = await prisma.schoolCycle.findUnique({
      where: {
        schoolId_name: {
          schoolId: user.schoolId,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un ciclo con ese nombre" },
        { status: 400 }
      );
    }

    const cycle = await prisma.schoolCycle.create({
      data: {
        schoolId: user.schoolId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "UPCOMING",
        inscriptionStart: inscriptionStart ? new Date(inscriptionStart) : null,
        inscriptionEnd: inscriptionEnd ? new Date(inscriptionEnd) : null,
        classesStart: classesStart ? new Date(classesStart) : null,
        classesEnd: classesEnd ? new Date(classesEnd) : null,
        inscriptionFee: inscriptionFee || null,
        monthlyTuition: monthlyTuition || null,
        materialsFee: materialsFee || null,
        autoPromotionEnabled: autoPromotionEnabled || false,
        promotionMinGPA: promotionMinGPA || null,
      },
    });

    return NextResponse.json(cycle, { status: 201 });
  } catch (error) {
    console.error("Error creating cycle:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
