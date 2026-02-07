import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Obtener ciclo específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    const cycle = await prisma.schoolCycle.findFirst({
      where: {
        id: params.id,
        schoolId: user.schoolId,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            charges: true,
          },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: "Ciclo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cycle);
  } catch (error) {
    console.error("Error fetching cycle:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// PATCH - Actualizar ciclo
export async function PATCH(
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

    const body = await req.json();

    // Verificar que el ciclo existe y pertenece a la escuela
    const existing = await prisma.schoolCycle.findFirst({
      where: {
        id: params.id,
        schoolId: user.schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ciclo no encontrado" }, { status: 404 });
    }

    // Si se está activando como ciclo actual
    if (body.isCurrentCycle === true && !existing.isCurrentCycle) {
      // Desactivar otros ciclos actuales
      await prisma.schoolCycle.updateMany({
        where: {
          schoolId: user.schoolId,
          isCurrentCycle: true,
          id: { not: params.id },
        },
        data: { isCurrentCycle: false },
      });
    }

    // Si se cambia el estado a ACTIVE
    if (body.status === "ACTIVE" && existing.status !== "ACTIVE") {
      // Marcar otros ciclos activos como completados
      await prisma.schoolCycle.updateMany({
        where: {
          schoolId: user.schoolId,
          status: "ACTIVE",
          id: { not: params.id },
        },
        data: { status: "COMPLETED" },
      });
      body.isCurrentCycle = true;
    }

    const updateData: any = {};

    // Solo actualizar campos que vienen en el body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isCurrentCycle !== undefined) updateData.isCurrentCycle = body.isCurrentCycle;
    if (body.inscriptionStart !== undefined) updateData.inscriptionStart = body.inscriptionStart ? new Date(body.inscriptionStart) : null;
    if (body.inscriptionEnd !== undefined) updateData.inscriptionEnd = body.inscriptionEnd ? new Date(body.inscriptionEnd) : null;
    if (body.classesStart !== undefined) updateData.classesStart = body.classesStart ? new Date(body.classesStart) : null;
    if (body.classesEnd !== undefined) updateData.classesEnd = body.classesEnd ? new Date(body.classesEnd) : null;
    if (body.inscriptionFee !== undefined) updateData.inscriptionFee = body.inscriptionFee;
    if (body.monthlyTuition !== undefined) updateData.monthlyTuition = body.monthlyTuition;
    if (body.materialsFee !== undefined) updateData.materialsFee = body.materialsFee;
    if (body.autoPromotionEnabled !== undefined) updateData.autoPromotionEnabled = body.autoPromotionEnabled;
    if (body.promotionMinGPA !== undefined) updateData.promotionMinGPA = body.promotionMinGPA;

    const cycle = await prisma.schoolCycle.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(cycle);
  } catch (error) {
    console.error("Error updating cycle:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar ciclo
export async function DELETE(
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

    // Verificar que el ciclo existe y pertenece a la escuela
    const cycle = await prisma.schoolCycle.findFirst({
      where: {
        id: params.id,
        schoolId: user.schoolId,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            charges: true,
          },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: "Ciclo no encontrado" }, { status: 404 });
    }

    // No permitir eliminar si tiene datos asociados
    if (cycle._count.enrollments > 0 || cycle._count.charges > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un ciclo con inscripciones o cargos asociados" },
        { status: 400 }
      );
    }

    await prisma.schoolCycle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Ciclo eliminado" });
  } catch (error) {
    console.error("Error deleting cycle:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
