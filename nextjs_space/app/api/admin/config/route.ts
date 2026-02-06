import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - List all system configurations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const configs = await prisma.systemConfig.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }]
    });

    // Group by category
    const grouped = configs.reduce((acc: Record<string, typeof configs>, config: typeof configs[0]) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {});

    return NextResponse.json({ configs, grouped });
  } catch (error) {
    console.error("Error fetching system configs:", error);
    return NextResponse.json(
      { error: "Error al obtener configuraciones" },
      { status: 500 }
    );
  }
}

// POST - Create or update a system configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value, description, category } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Clave y valor son requeridos" },
        { status: 400 }
      );
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description,
        category: category || "general"
      },
      create: {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description,
        category: category || "general"
      }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: "UPDATE_CONFIG",
        entityType: "SystemConfig",
        entityId: config.id,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ key, value })
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving system config:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a system configuration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Clave es requerida" },
        { status: 400 }
      );
    }

    await prisma.systemConfig.delete({
      where: { key }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: "DELETE_CONFIG",
        entityType: "SystemConfig",
        entityId: key,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ key })
      }
    });

    return NextResponse.json({ message: "Configuración eliminada" });
  } catch (error) {
    console.error("Error deleting system config:", error);
    return NextResponse.json(
      { error: "Error al eliminar configuración" },
      { status: 500 }
    );
  }
}
