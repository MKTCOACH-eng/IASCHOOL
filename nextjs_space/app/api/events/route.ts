import { NextRequest, NextResponse } from "next/server";
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

// GET - List events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const groupId = searchParams.get("groupId");

    // Build where clause
    const where: any = {
      schoolId: user.schoolId,
      OR: [
        { isPublic: true },
        { createdById: user.id },
        { attendees: { some: { userId: user.id } } },
      ],
    };

    // Date filters
    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.startDate = { ...where.startDate, lte: new Date(endDate) };
    }
    if (type) {
      where.type = type;
    }
    if (groupId) {
      where.groupId = groupId;
    }

    // For parents, also show events from their children's groups
    if (user.role === "PADRE") {
      const userWithChildren = await db.user.findUnique({
        where: { id: user.id },
        include: { children: { select: { groupId: true } } },
      });
      
      const childGroupIds = userWithChildren?.children
        .map(c => c.groupId)
        .filter((id): id is string => id !== null) || [];
      
      if (childGroupIds.length > 0) {
        where.OR.push({ groupId: { in: childGroupIds } });
      }
    }

    // For teachers, show events from their groups
    if (user.role === "PROFESOR") {
      const teacherGroups = await db.group.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      
      const teacherGroupIds = teacherGroups.map(g => g.id);
      if (teacherGroupIds.length > 0) {
        where.OR.push({ groupId: { in: teacherGroupIds } });
      }
    }

    const events = await db.event.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        group: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        attendees: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { attendees: true } },
      },
      orderBy: { startDate: "asc" },
    });

    // Also fetch task deadlines as virtual events
    const taskWhere: any = {
      group: { schoolId: user.schoolId },
      status: "PUBLISHED",
      dueDate: { not: null },
    };

    if (startDate) {
      taskWhere.dueDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      taskWhere.dueDate = { ...taskWhere.dueDate, lte: new Date(endDate) };
    }

    // Filter tasks based on user role
    if (user.role === "PADRE") {
      const userWithChildren = await db.user.findUnique({
        where: { id: user.id },
        include: { children: { select: { groupId: true } } },
      });
      const childGroupIds = userWithChildren?.children
        .map((c) => c.groupId)
        .filter((id): id is string => id !== null) || [];
      if (childGroupIds.length > 0) {
        taskWhere.groupId = { in: childGroupIds };
      } else {
        taskWhere.groupId = "none"; // No tasks
      }
    } else if (user.role === "PROFESOR") {
      taskWhere.teacherId = user.id;
    }

    const tasks = await db.task.findMany({
      where: taskWhere,
      include: {
        subject: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true, role: true } },
      },
    });

    // Convert tasks to event format
    const taskEvents = tasks.map((task) => ({
      id: `task-${task.id}`,
      title: `📚 ${task.title}`,
      description: task.description,
      startDate: task.dueDate!.toISOString(),
      endDate: null,
      allDay: true,
      type: "ACADEMICO",
      color: task.subject?.color || "#EA580C",
      location: null,
      isPublic: true,
      createdBy: task.teacher,
      group: task.group,
      task: { id: task.id, title: task.title },
      attendees: [],
      _count: { attendees: 0 },
      isTaskDeadline: true,
    }));

    // Combine and sort by date
    const allEvents = [...events, ...taskEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    // Only ADMIN and PROFESOR can create events
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json(
        { error: "Solo administradores y profesores pueden crear eventos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      color,
      location,
      isPublic,
      groupId,
      attendeeIds,
    } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Título y fecha de inicio son requeridos" },
        { status: 400 }
      );
    }

    // Create event
    const event = await db.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay ?? false,
        type: type || "ESCOLAR",
        color: color || "#1B4079",
        location,
        isPublic: isPublic ?? true,
        schoolId: user.schoolId,
        createdById: user.id,
        groupId: groupId || null,
        attendees: attendeeIds?.length
          ? {
              create: attendeeIds.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        group: { select: { id: true, name: true } },
        attendees: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
