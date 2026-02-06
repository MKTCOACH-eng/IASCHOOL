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

// GET - Obtener directorio de personal escolar
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const exportFormat = searchParams.get("export");

    const where: any = {
      schoolId: user.schoolId,
      role: { in: ["ADMIN", "PROFESOR"] },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter && roleFilter !== "all" && ["ADMIN", "PROFESOR"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    // Si es exportación, obtener todos
    if (exportFormat === "csv") {
      const allStaff = await prisma.user.findMany({
        where,
        include: {
          teacherGroups: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      });

      const headers = ["Nombre", "Email", "Teléfono", "Rol", "Grupos Asignados"];
      const rows = allStaff.map((s: any) => [
        s.name,
        s.email,
        s.phone || "",
        s.role === "ADMIN" ? "Administrador" : "Profesor",
        s.teacherGroups.map((g: any) => g.name).join("; "),
      ].join(","));

      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="directorio_personal_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          teacherGroups: { select: { id: true, name: true } },
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching staff directory:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
