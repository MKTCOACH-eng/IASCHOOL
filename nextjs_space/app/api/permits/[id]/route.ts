import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    
    const permit = await db.permitRequest.findUnique({
      where: { id: params.id },
      include: {
        student: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            group: { select: { name: true } },
            parents: { select: { id: true } }
          } 
        },
        createdBy: { select: { name: true } },
        reviewedBy: { select: { name: true } }
      }
    });
    
    if (!permit || permit.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Permiso no encontrado" }, { status: 404 });
    }
    
    // Check access for parents
    if (user.role === 'PADRE') {
      const isParent = permit.student.parents.some((p: any) => p.id === user.id);
      if (!isParent) {
        return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
      }
    }
    
    return NextResponse.json(permit);
  } catch (error) {
    console.error("Error fetching permit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    if (!['ADMIN', 'SUPER_ADMIN', 'PROFESOR'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos para revisar" }, { status: 403 });
    }
    
    const permit = await db.permitRequest.findUnique({ where: { id: params.id } });
    if (!permit || permit.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Permiso no encontrado" }, { status: 404 });
    }
    
    const body = await request.json();
    const { status, reviewNotes } = body;
    
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    
    const updated = await db.permitRequest.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedById: user.id,
        reviewedAt: new Date()
      }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating permit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const permit = await db.permitRequest.findUnique({ where: { id: params.id } });
    
    if (!permit || permit.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Permiso no encontrado" }, { status: 404 });
    }
    
    // Only creator or admin can delete
    if (permit.createdById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    // Can only delete pending permits
    if (permit.status !== 'PENDING') {
      return NextResponse.json({ error: "Solo se pueden eliminar permisos pendientes" }, { status: 400 });
    }
    
    await db.permitRequest.delete({ where: { id: params.id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting permit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
