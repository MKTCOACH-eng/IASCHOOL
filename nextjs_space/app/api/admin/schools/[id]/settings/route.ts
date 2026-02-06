import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Get school settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    let settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: id }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          schoolId: id
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// PATCH - Update school settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      modulesEnabled, 
      maxUsers, 
      maxStudents, 
      maxGroups, 
      storageLimit,
      customDomain,
      customCss,
      welcomeMessage,
      planType,
      planExpiresAt
    } = body;

    // Check if school exists
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json(
        { error: "Escuela no encontrada" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (modulesEnabled !== undefined) updateData.modulesEnabled = typeof modulesEnabled === 'string' ? modulesEnabled : JSON.stringify(modulesEnabled);
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents;
    if (maxGroups !== undefined) updateData.maxGroups = maxGroups;
    if (storageLimit !== undefined) updateData.storageLimit = storageLimit;
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (customCss !== undefined) updateData.customCss = customCss;
    if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage;
    if (planType !== undefined) updateData.planType = planType;
    if (planExpiresAt !== undefined) updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;

    const settings = await prisma.schoolSettings.upsert({
      where: { schoolId: id },
      update: updateData,
      create: {
        schoolId: id,
        ...updateData
      }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: "UPDATE_SCHOOL_SETTINGS",
        entityType: "SchoolSettings",
        entityId: settings.id,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ schoolId: id, changes: updateData })
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating school settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
