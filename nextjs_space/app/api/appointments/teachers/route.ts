import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string | null;
}

// GET - Listar profesores con disponibilidad (para padres)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId") || user.schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: "Se requiere schoolId" }, { status: 400 });
    }

    // Obtener profesores con disponibilidad configurada
    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: "PROFESOR",
        teacherAvailability: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        teacherGroups: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        teacherAvailability: {
          where: { isActive: true },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            slotDuration: true,
            location: true,
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
