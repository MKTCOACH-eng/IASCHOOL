import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    
    let whereClause: any = { schoolId: user.schoolId };
    
    // Parents only see their children's permits
    if (user.role === 'PADRE') {
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true }
      });
      whereClause.studentId = { in: children.map((c: { id: string }) => c.id) };
    }
    
    if (status) whereClause.status = status;
    if (studentId) whereClause.studentId = studentId;
    
    const permits = await db.permitRequest.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, group: { select: { name: true } } } },
        createdBy: { select: { name: true } },
        reviewedBy: { select: { name: true } }
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(permits);
  } catch (error) {
    console.error("Error fetching permits:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const body = await request.json();
    const {
      studentId,
      type,
      title,
      reason,
      startDate,
      endDate,
      startTime,
      endTime,
      attachmentUrl,
      attachmentName
    } = body;
    
    if (!studentId || !type || !title || !reason || !startDate) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    
    // Verify parent has access to this student
    if (user.role === 'PADRE') {
      const hasAccess = await db.student.findFirst({
        where: {
          id: studentId,
          parents: { some: { id: user.id } }
        }
      });
      if (!hasAccess) {
        return NextResponse.json({ error: "No tienes acceso a este estudiante" }, { status: 403 });
      }
    }
    
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true }
    });
    
    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }
    
    const permit = await db.permitRequest.create({
      data: {
        schoolId: student.schoolId,
        studentId,
        createdById: user.id,
        type,
        title,
        reason,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        startTime,
        endTime,
        attachmentUrl,
        attachmentName,
        status: 'PENDING'
      },
      include: {
        student: { select: { firstName: true, lastName: true } }
      }
    });
    
    return NextResponse.json(permit, { status: 201 });
  } catch (error) {
    console.error("Error creating permit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
