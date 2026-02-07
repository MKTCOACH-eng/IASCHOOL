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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    
    const enrollments = await db.enrollment.findMany({
      where: {
        schoolId: user.schoolId,
        ...(status && { status: status as any }),
        ...(year && { requestedYear: parseInt(year) })
      },
      include: {
        reviewedBy: { select: { name: true } },
        enrolledStudent: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Public endpoint for new enrollment requests
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      schoolCode,
      parentName,
      parentEmail,
      parentPhone,
      relationship,
      studentName,
      studentBirthDate,
      studentGender,
      currentSchool,
      currentGrade,
      requestedGrade,
      requestedYear,
      siblings,
      howDidYouHear,
      specialNeeds,
      comments
    } = body;
    
    // Validate required fields
    if (!schoolCode || !parentName || !parentEmail || !parentPhone || 
        !studentName || !studentBirthDate || !requestedGrade || !requestedYear) {
      return NextResponse.json({ 
        error: "Faltan campos requeridos" 
      }, { status: 400 });
    }
    
    // Find school by code
    const school = await db.school.findUnique({
      where: { code: schoolCode }
    });
    
    if (!school) {
      return NextResponse.json({ 
        error: "Código de escuela inválido" 
      }, { status: 404 });
    }
    
    // Check for duplicate
    const existing = await db.enrollment.findFirst({
      where: {
        schoolId: school.id,
        parentEmail,
        studentName,
        requestedYear,
        status: { notIn: ['REJECTED', 'CANCELLED'] }
      }
    });
    
    if (existing) {
      return NextResponse.json({ 
        error: "Ya existe una solicitud para este estudiante" 
      }, { status: 400 });
    }
    
    const enrollment = await db.enrollment.create({
      data: {
        schoolId: school.id,
        parentName,
        parentEmail,
        parentPhone,
        relationship: relationship || 'padre',
        studentName,
        studentBirthDate: new Date(studentBirthDate),
        studentGender,
        currentSchool,
        currentGrade,
        requestedGrade,
        requestedYear,
        siblings,
        howDidYouHear,
        specialNeeds,
        comments,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Solicitud de inscripción enviada correctamente",
      enrollmentId: enrollment.id
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
