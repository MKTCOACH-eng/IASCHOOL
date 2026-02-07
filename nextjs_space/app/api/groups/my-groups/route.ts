import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

// GET - Obtener grupos del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    let groups: Array<{
      id: string;
      name: string;
      _count?: { students: number };
      teacher?: { id: string; name: string } | null;
      childName?: string;
      isVocal?: boolean;
      isPrimary?: boolean;
    }> = [];

    // Obtener grupos donde es vocal (aplica para VOCAL y PADRE que pueda ser vocal)
    const vocalGroups = await db.groupVocal.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        group: {
          include: {
            teacher: { select: { id: true, name: true } },
            _count: { select: { students: true } },
          },
        },
      },
    });

    const vocalGroupMap = new Map(
      vocalGroups.map((v) => [v.groupId, { isPrimary: v.isPrimary }])
    );

    if (user.role === "VOCAL") {
      // Para vocales: obtener sus grupos asignados
      groups = vocalGroups.map((v) => ({
        ...v.group,
        isVocal: true,
        isPrimary: v.isPrimary,
      }));
    } else if (user.role === "PADRE") {
      // Para padres: obtener grupos de sus hijos
      const userWithChildren = await db.user.findUnique({
        where: { id: user.id },
        include: {
          children: {
            where: { isActive: true },
            include: {
              group: {
                include: {
                  teacher: {
                    select: { id: true, name: true },
                  },
                  _count: {
                    select: { students: true },
                  },
                },
              },
            },
          },
        },
      });

      if (userWithChildren?.children) {
        // Obtener grupos únicos de los hijos
        const uniqueGroups = new Map();
        for (const child of userWithChildren.children) {
          if (child.group && !uniqueGroups.has(child.group.id)) {
            const vocalInfo = vocalGroupMap.get(child.group.id);
            uniqueGroups.set(child.group.id, {
              ...child.group,
              childName: `${child.firstName} ${child.lastName}`,
              isVocal: !!vocalInfo,
              isPrimary: vocalInfo?.isPrimary || false,
            });
          }
        }
        groups = Array.from(uniqueGroups.values());
      }
    } else if (user.role === "PROFESOR") {
      // Para profesores: obtener grupos que tienen asignados
      groups = await db.group.findMany({
        where: {
          schoolId: user.schoolId,
          teacherId: user.id,
          isActive: true,
        },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });
    } else if (user.role === "ADMIN") {
      // Para admins: obtener todos los grupos del colegio
      groups = await db.group.findMany({
        where: {
          schoolId: user.schoolId,
          isActive: true,
        },
        include: {
          teacher: {
            select: { id: true, name: true },
          },
          _count: {
            select: { students: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    // Obtener chats grupales existentes para estos grupos
    const groupIds = groups.map((g: { id: string }) => g.id);
    const existingChats = await db.conversation.findMany({
      where: {
        groupId: { in: groupIds },
        type: "GROUP_PARENTS",
        isActive: true,
      },
      select: {
        id: true,
        groupId: true,
        _count: {
          select: { participants: true },
        },
      },
    });

    // Mapear chats a grupos
    const chatsByGroup = new Map(
      existingChats.map((c) => [c.groupId, c])
    );

    const groupsWithChatInfo = groups.map((group) => ({
      id: group.id,
      name: group.name,
      studentsCount: group._count?.students || 0,
      teacher: group.teacher,
      childName: group.childName,
      isVocal: group.isVocal || false,
      isPrimary: group.isPrimary || false,
      existingChat: chatsByGroup.get(group.id) || null,
    }));

    return NextResponse.json(groupsWithChatInfo);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos" },
      { status: 500 }
    );
  }
}
