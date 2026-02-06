import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";
import { getFileUrl, deleteFile } from "@/lib/s3";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Obtener URL de descarga del documento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const document = await db.gradeDocument.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            parents: { select: { id: true } },
            group: { select: { teacherId: true } },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar acceso
    const isParent = document.student.parents.some((p) => p.id === user.id);
    const isTeacher = document.student.group?.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isParent && !isTeacher && !isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Generar URL de descarga
    const downloadUrl = await getFileUrl(
      document.cloudStoragePath!,
      document.isPublic
    );

    return NextResponse.json({
      ...document,
      downloadUrl,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Error al obtener documento" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar documento (solo ADMIN o quien lo subió)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const document = await db.gradeDocument.findUnique({
      where: { id },
      include: {
        student: { select: { schoolId: true } },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Solo admin o quien subió el documento puede eliminarlo
    const canDelete =
      user.role === "ADMIN" || document.uploadedById === user.id;

    if (!canDelete) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Eliminar archivo de S3
    if (document.cloudStoragePath) {
      try {
        await deleteFile(document.cloudStoragePath);
      } catch (e) {
        console.error("Error deleting file from S3:", e);
      }
    }

    // Eliminar registro de la base de datos
    await db.gradeDocument.delete({ where: { id } });

    return NextResponse.json({ message: "Documento eliminado" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    );
  }
}
