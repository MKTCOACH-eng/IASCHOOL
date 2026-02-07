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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const enrollment = await db.enrollment.findUnique({
      where: { id: params.id },
      include: {
        reviewedBy: { select: { name: true } },
        enrolledStudent: true
      }
    });
    
    if (!enrollment || enrollment.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const enrollment = await db.enrollment.findUnique({ where: { id: params.id } });
    if (!enrollment || enrollment.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    
    const body = await request.json();
    const { status, interviewDate, interviewNotes, rejectionReason, priority } = body;
    
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (['ACCEPTED', 'REJECTED'].includes(status)) {
        updateData.reviewedById = user.id;
        updateData.reviewedAt = new Date();
      }
      if (status === 'REJECTED' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }
    
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes;
    if (priority !== undefined) updateData.priority = priority;
    
    const updated = await db.enrollment.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
