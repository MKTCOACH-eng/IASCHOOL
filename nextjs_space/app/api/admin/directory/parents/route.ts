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

// GET - Obtener directorio de padres
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
      role: "PADRE",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (groupId && groupId !== "all") {
      where.children = {
        some: { groupId },
      };
    }

    // Si es exportación, obtener todos
    if (exportFormat === "csv") {
      const allParents = await prisma.user.findMany({
        where,
        include: {
          children: {
            select: { firstName: true, lastName: true, group: { select: { name: true } } },
          },
        },
        orderBy: { name: "asc" },
      });

      const headers = ["Nombre", "Email", "Teléfono", "Hijos", "Grupos"];
      const rows = allParents.map((p: any) => {
        const hijos = p.children.map((c: any) => `${c.firstName} ${c.lastName}`).join("; ");
        const grupos = [...new Set(p.children.map((c: any) => c.group?.name || ""))].join("; ");
        return [
          p.name,
          p.email,
          p.phone || "",
          hijos,
          grupos,
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="directorio_padres_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const [parents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              group: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Obtener grupos para filtros
    const groups = await prisma.group.findMany({
      where: { schoolId: user.schoolId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      parents,
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching parents directory:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
