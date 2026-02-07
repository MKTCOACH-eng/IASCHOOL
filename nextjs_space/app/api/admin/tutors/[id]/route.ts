import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// PATCH - Actualizar permisos del tutor
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

    // Verificar que la relación existe
    const existing = await prisma.studentTutor.findFirst({
      where: {
        id: params.id,
        student: { schoolId: user.schoolId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Relación no encontrada" }, { status: 404 });
    }

    // Si se está configurando como contacto principal
    if (body.isPrimaryContact === true && !existing.isPrimaryContact) {
      await prisma.studentTutor.updateMany({
        where: {
          studentId: existing.studentId,
          isPrimaryContact: true,
          id: { not: params.id },
        },
        data: { isPrimaryContact: false },
      });
    }

    const updateData: any = {};

    // Actualizar solo campos que vienen
    if (body.relationship !== undefined) updateData.relationship = body.relationship;
    if (body.relationshipDetail !== undefined) updateData.relationshipDetail = body.relationshipDetail;
    if (body.isPrimaryContact !== undefined) updateData.isPrimaryContact = body.isPrimaryContact;
    if (body.hasFullAccess !== undefined) updateData.hasFullAccess = body.hasFullAccess;
    if (body.canViewGrades !== undefined) updateData.canViewGrades = body.canViewGrades;
    if (body.canViewAttendance !== undefined) updateData.canViewAttendance = body.canViewAttendance;
    if (body.canViewPayments !== undefined) updateData.canViewPayments = body.canViewPayments;
    if (body.canMakePayments !== undefined) updateData.canMakePayments = body.canMakePayments;
    if (body.canPickup !== undefined) updateData.canPickup = body.canPickup;
    if (body.canCommunicate !== undefined) updateData.canCommunicate = body.canCommunicate;
    if (body.canReceiveNotifications !== undefined) updateData.canReceiveNotifications = body.canReceiveNotifications;
    if (body.canRequestPermissions !== undefined) updateData.canRequestPermissions = body.canRequestPermissions;
    if (body.custodyType !== undefined) updateData.custodyType = body.custodyType;
    if (body.custodyNotes !== undefined) updateData.custodyNotes = body.custodyNotes;
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
      if (!body.isActive) {
        updateData.deactivatedAt = new Date();
        updateData.deactivatedReason = body.deactivatedReason || null;
      } else {
        updateData.deactivatedAt = null;
        updateData.deactivatedReason = null;
      }
    }

    const updated = await prisma.studentTutor.update({
      where: { id: params.id },
      data: updateData,
      include: {
        tutor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating tutor:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar relación tutor-estudiante
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

    // Verificar que la relación existe
    const existing = await prisma.studentTutor.findFirst({
      where: {
        id: params.id,
        student: { schoolId: user.schoolId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Relación no encontrada" }, { status: 404 });
    }

    await prisma.studentTutor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Relación eliminada" });
  } catch (error) {
    console.error("Error deleting tutor relation:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
