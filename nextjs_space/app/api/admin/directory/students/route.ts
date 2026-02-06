import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Obtener directorio de alumnos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!["ADMIN", "PROFESOR", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const groupId = searchParams.get("groupId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const exportFormat = searchParams.get("export");

    const where: any = {
      schoolId: user.schoolId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (groupId && groupId !== "all") {
      where.groupId = groupId;
    }

    // Si es exportación, obtener todos
    if (exportFormat === "csv") {
      const allStudents = await prisma.student.findMany({
        where,
        include: {
          group: { select: { name: true } },
          parents: { select: { name: true, email: true, phone: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });

      // Generar CSV
      const headers = ["Nombre", "Apellido", "Grupo", "Padre/Madre 1", "Email 1", "Tel 1", "Padre/Madre 2", "Email 2", "Tel 2"];
      const rows = allStudents.map((s: any) => {
        const p1 = s.parents[0];
        const p2 = s.parents[1];
        return [
          s.firstName,
          s.lastName,
          s.group?.name || "",
          p1?.name || "",
          p1?.email || "",
          p1?.phone || "",
          p2?.name || "",
          p2?.email || "",
          p2?.phone || "",
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="directorio_alumnos_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          group: { select: { id: true, name: true } },
          parents: { select: { id: true, name: true, email: true, phone: true } },
          user: { select: { email: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    // Obtener grupos para filtros
    const groups = await prisma.group.findMany({
      where: { schoolId: user.schoolId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      students,
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students directory:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
