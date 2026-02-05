import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Listar usuarios disponibles para chat
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Obtener usuarios del mismo colegio, excluyendo al usuario actual
    const users = await db.user.findMany({
      where: {
        schoolId: user.schoolId,
        id: { not: user.id },
        profileCompleted: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: [
        { role: "asc" },
        { name: "asc" },
      ],
    });

    // Filtrar según el rol del usuario actual
    // PADRE: puede chatear con ADMIN, PROFESOR
    // PROFESOR: puede chatear con ADMIN, PADRE, otros PROFESORES
    // ADMIN: puede chatear con todos
    // ALUMNO: puede chatear con PROFESOR, otros ALUMNOS
    let filteredUsers = users;

    if (user.role === "PADRE") {
      filteredUsers = users.filter(
        (u) => u.role === "ADMIN" || u.role === "PROFESOR"
      );
    } else if (user.role === "ALUMNO") {
      filteredUsers = users.filter(
        (u) => u.role === "PROFESOR" || u.role === "ALUMNO"
      );
    }

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
