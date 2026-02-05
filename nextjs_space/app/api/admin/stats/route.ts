export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const [totalAnnouncements, totalParents] = await Promise.all([
      prisma.announcement.count({
        where: { schoolId: user?.schoolId },
      }),
      prisma.user.count({
        where: {
          schoolId: user?.schoolId,
          role: "PADRE",
        },
      }),
    ]);

    return NextResponse.json({
      totalAnnouncements,
      totalParents,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
