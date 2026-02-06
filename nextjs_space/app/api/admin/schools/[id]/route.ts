import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Get single school details
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

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            students: true,
            groups: true,
            announcements: true,
            documents: true,
            conversations: true,
            events: true,
            charges: true
          }
        },
        users: {
          where: { role: "ADMIN" },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: "Escuela no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Error al obtener escuela" },
      { status: 500 }
    );
  }
}

// PATCH - Update school
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
    const { name, email, phone, address, website, description, primaryColor, secondaryColor, logoUrl, isActive } = body;

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id }
    });

    if (!existingSchool) {
      return NextResponse.json(
        { error: "Escuela no encontrada" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const school = await prisma.school.update({
      where: { id },
      data: updateData,
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            students: true,
            groups: true
          }
        }
      }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: isActive === false ? "DEACTIVATE_SCHOOL" : "UPDATE_SCHOOL",
        entityType: "School",
        entityId: id,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ changes: updateData })
      }
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Error al actualizar escuela" },
      { status: 500 }
    );
  }
}

// DELETE - Delete school (soft delete by setting isActive to false)
export async function DELETE(
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

    const school = await prisma.school.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: "DEACTIVATE_SCHOOL",
        entityType: "School",
        entityId: id,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ schoolName: school.name })
      }
    });

    return NextResponse.json({ message: "Escuela desactivada correctamente" });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Error al desactivar escuela" },
      { status: 500 }
    );
  }
}
