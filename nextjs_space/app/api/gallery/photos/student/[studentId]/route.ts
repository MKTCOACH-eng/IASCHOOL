import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// Get all photos where a specific student is tagged
export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    // Check if user is parent of this student or admin
    if (user.role === 'PADRE') {
      const isParent = await db.student.findFirst({
        where: {
          id: params.studentId,
          parents: { some: { id: user.id } }
        }
      });
      if (!isParent) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    const photos = await db.photo.findMany({
      where: {
        tags: {
          some: { studentId: params.studentId }
        },
        album: { isActive: true }
      },
      include: {
        album: { select: { id: true, title: true, eventDate: true } },
        tags: {
          where: { studentId: params.studentId },
          include: {
            student: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching student photos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
