import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// GET - Obtener compañeros de clase para formar equipos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user.role !== "ALUMNO") {
      return NextResponse.json({ error: "Solo para alumnos" }, { status: 403 });
    }

    // Obtener el estudiante actual y su grupo
    const currentStudent = await db.student.findFirst({
      where: { userId: user.id },
      select: { groupId: true }
    });

    if (!currentStudent?.groupId) {
      return NextResponse.json([]);
    }

    // Obtener compañeros del mismo grupo
    const classmates = await db.student.findMany({
      where: {
        groupId: currentStudent.groupId,
        isActive: true,
        userId: { not: user.id } // Excluir al usuario actual
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Formatear respuesta
    const formattedClassmates = classmates
      .filter(c => c.user) // Solo los que tienen cuenta de usuario
      .map(c => ({
        id: c.user!.id,
        name: c.user!.name || `${c.firstName} ${c.lastName}`,
        email: c.user!.email,
        studentId: c.id
      }));

    return NextResponse.json(formattedClassmates);
  } catch (error) {
    console.error("Error fetching classmates:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
