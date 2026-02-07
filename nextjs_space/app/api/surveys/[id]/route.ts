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
    const survey = await db.survey.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { responses: true } },
        responses: ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        } : {
          where: { userId: user.id },
          select: { id: true, answers: true, score: true }
        }
      }
    });
    
    if (!survey || survey.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
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
    
    const survey = await db.survey.findUnique({ where: { id: params.id } });
    if (!survey || survey.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }
    
    const body = await request.json();
    const updated = await db.survey.update({
      where: { id: params.id },
      data: body
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating survey:", error);
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const survey = await db.survey.findUnique({ where: { id: params.id } });
    if (!survey || survey.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }
    
    await db.survey.delete({ where: { id: params.id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
