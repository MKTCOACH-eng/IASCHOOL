import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  role: string;
  schoolId: string;
}

// GET - Listar materias
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const subjects = await db.subject.findMany({
      where: {
        schoolId: user.schoolId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Error al obtener materias" }, { status: 500 });
  }
}

// POST - Crear materia (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { name, color } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const subject = await db.subject.create({
      data: {
        name: name.trim(),
        color: color || "#1B4079",
        schoolId: user.schoolId,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating subject:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una materia con ese nombre" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear materia" }, { status: 500 });
  }
}
