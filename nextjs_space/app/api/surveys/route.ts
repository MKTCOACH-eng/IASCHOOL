import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const schoolId = user.schoolId;
    
    // Admins see all surveys, others only see active ones they can respond to
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    
    const surveys = await db.survey.findMany({
      where: isAdmin 
        ? { schoolId }
        : {
            schoolId,
            status: 'ACTIVE',
            targetRoles: { has: user.role },
            OR: [
              { startsAt: null },
              { startsAt: { lte: new Date() } }
            ]
          },
      include: {
        _count: { select: { responses: true } },
        createdBy: { select: { name: true } },
        responses: isAdmin ? false : {
          where: { userId: user.id },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      title,
      description,
      type = 'SATISFACTION',
      questions = [],
      targetRoles = ['PADRE'],
      targetGroups = [],
      startsAt,
      endsAt,
      isAnonymous = true,
      status = 'DRAFT'
    } = body;
    
    if (!title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }
    
    const survey = await db.survey.create({
      data: {
        schoolId: user.schoolId,
        createdById: user.id,
        title,
        description,
        type,
        questions,
        targetRoles,
        targetGroups,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isAnonymous,
        status
      }
    });
    
    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
