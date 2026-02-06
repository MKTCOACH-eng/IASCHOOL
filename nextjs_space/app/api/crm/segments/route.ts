import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string | null;
}

// GET - List all segments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const segments = await prisma.crmSegment.findMany({
      where: {
        schoolId: user.schoolId!,
        isActive: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json({ error: "Error al obtener segmentos" }, { status: 500 });
  }
}

// POST - Create new segment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, filters } = body;

    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    // Calculate user count based on filters
    let userCount = 0;
    const whereClause: any = { schoolId: user.schoolId! };

    if (filters?.roles?.length > 0) {
      whereClause.role = { in: filters.roles };
    }

    if (filters?.groupId) {
      // For parents with children in specific group
      const students = await prisma.student.findMany({
        where: { groupId: filters.groupId },
        include: { parents: { select: { id: true } } }
      });
      const parentIds = students.flatMap((s: any) => s.parents.map((p: any) => p.id));
      whereClause.id = { in: parentIds };
    }

    userCount = await prisma.user.count({ where: whereClause });

    const segment = await prisma.crmSegment.create({
      data: {
        schoolId: user.schoolId!,
        name,
        description,
        filters: filters || {},
        userCount
      }
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error("Error creating segment:", error);
    return NextResponse.json({ error: "Error al crear segmento" }, { status: 500 });
  }
}

// DELETE - Delete segment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.crmSegment.update({
      where: { id, schoolId: user.schoolId! },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting segment:", error);
    return NextResponse.json({ error: "Error al eliminar segmento" }, { status: 500 });
  }
}
