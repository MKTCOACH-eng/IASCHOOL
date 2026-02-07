import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// Get all students with their profile photo status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    const students = await db.student.findMany({
      where: {
        schoolId: user.schoolId,
        isActive: true,
        ...(groupId ? { groupId } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        group: { select: { id: true, name: true } }
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });

    const stats = {
      total: students.length,
      withPhoto: students.filter(s => s.photoUrl).length,
      withoutPhoto: students.filter(s => !s.photoUrl).length
    };

    return NextResponse.json({ students, stats });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
