import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Listar documentos de calificaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    let studentIds: string[] = [];

    if (user.role === "PADRE") {
      // Padre ve documentos de sus hijos
      const children = await db.student.findMany({
        where: { parents: { some: { id: user.id } } },
        select: { id: true },
      });
      studentIds = children.map((c) => c.id);
      
      if (studentId && !studentIds.includes(studentId)) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      if (studentId) {
        studentIds = [studentId];
      }
    } else if (user.role === "PROFESOR") {
      // Profesor ve documentos de estudiantes en sus grupos
      const groups = await db.group.findMany({
        where: { teacherId: user.id },
        include: { students: { select: { id: true } } },
      });
      studentIds = groups.flatMap((g) => g.students.map((s) => s.id));
      
      if (studentId && !studentIds.includes(studentId)) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      if (studentId) {
        studentIds = [studentId];
      }
    } else if (user.role === "ADMIN") {
      // Admin ve todos los documentos
      if (studentId) {
        studentIds = [studentId];
      } else {
        const students = await db.student.findMany({
          where: { schoolId: user.schoolId },
          select: { id: true },
        });
        studentIds = students.map((s) => s.id);
      }
    }

    const documents = await db.gradeDocument.findMany({
      where: {
        studentId: { in: studentIds },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            group: { select: { name: true } },
          },
        },
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching grade documents:", error);
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}

// POST - Subir documento de calificaciones (solo ADMIN o PROFESOR)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "PROFESOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      studentId,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      cloudStoragePath,
      isPublic,
      period,
    } = body;

    if (!title?.trim() || !studentId || !fileName || !cloudStoragePath) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe y pertenece a la escuela
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.schoolId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    // Si es profesor, verificar que tenga acceso al estudiante
    if (user.role === "PROFESOR") {
      const hasAccess = await db.group.findFirst({
        where: {
          teacherId: user.id,
          students: { some: { id: studentId } },
        },
      });
      if (!hasAccess) {
        return NextResponse.json(
          { error: "Sin acceso a este estudiante" },
          { status: 403 }
        );
      }
    }

    const document = await db.gradeDocument.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        studentId,
        uploadedById: user.id,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        cloudStoragePath,
        isPublic: isPublic || false,
        period: period?.trim() || null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating grade document:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    );
  }
}
