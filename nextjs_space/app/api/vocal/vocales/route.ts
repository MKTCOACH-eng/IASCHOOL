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

// GET - Obtener vocales de un grupo
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
    }

    const vocales = await prisma.groupVocal.findMany({
      where: { groupId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        group: { select: { id: true, name: true } }
      },
      orderBy: { isPrimary: "desc" }
    });

    return NextResponse.json(vocales);
  } catch (error) {
    console.error("Error fetching vocales:", error);
    return NextResponse.json({ error: "Error al obtener vocales" }, { status: 500 });
  }
}

// POST - Asignar vocal a grupo (solo admins)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo admins pueden asignar vocales" }, { status: 403 });
    }

    const body = await req.json();
    const { groupId, userId, isPrimary } = body;

    if (!groupId || !userId) {
      return NextResponse.json({ error: "groupId y userId requeridos" }, { status: 400 });
    }

    // Verificar que el grupo existe y pertenece a la escuela
    const group = await prisma.group.findFirst({
      where: { id: groupId, schoolId: user.schoolId }
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario existe y es padre con hijos en el grupo
    const parentUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: { in: ["PADRE", "VOCAL"] },
        schoolId: user.schoolId,
        children: {
          some: { groupId }
        }
      }
    });

    if (!parentUser) {
      return NextResponse.json(
        { error: "El usuario debe ser padre con hijos en este grupo" },
        { status: 400 }
      );
    }

    // Verificar límite de 2 vocales por grupo
    const existingVocales = await prisma.groupVocal.count({
      where: { groupId, isActive: true }
    });

    if (existingVocales >= 2) {
      return NextResponse.json(
        { error: "Ya hay 2 vocales asignados a este grupo" },
        { status: 400 }
      );
    }

    // Verificar si ya es vocal del grupo
    const existing = await prisma.groupVocal.findFirst({
      where: { groupId, userId }
    });

    if (existing) {
      // Reactivar si estaba inactivo
      const updated = await prisma.groupVocal.update({
        where: { id: existing.id },
        data: { isActive: true, isPrimary: isPrimary || false }
      });
      
      // Actualizar rol del usuario
      await prisma.user.update({
        where: { id: userId },
        data: { role: "VOCAL" }
      });

      return NextResponse.json(updated);
    }

    // Si es el primer vocal o se marca como primario, actualizar otros
    if (isPrimary && existingVocales > 0) {
      await prisma.groupVocal.updateMany({
        where: { groupId, isActive: true },
        data: { isPrimary: false }
      });
    }

    // Crear nuevo registro de vocal
    const vocal = await prisma.groupVocal.create({
      data: {
        groupId,
        userId,
        isPrimary: isPrimary || existingVocales === 0 // Primero es primario por defecto
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true } }
      }
    });

    // Actualizar rol del usuario a VOCAL
    await prisma.user.update({
      where: { id: userId },
      data: { role: "VOCAL" }
    });

    return NextResponse.json(vocal, { status: 201 });
  } catch (error) {
    console.error("Error assigning vocal:", error);
    return NextResponse.json({ error: "Error al asignar vocal" }, { status: 500 });
  }
}

// DELETE - Remover vocal de grupo (solo admins)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Solo admins pueden remover vocales" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const vocalId = searchParams.get("id");

    if (!vocalId) {
      return NextResponse.json({ error: "ID de vocal requerido" }, { status: 400 });
    }

    const vocal = await prisma.groupVocal.findUnique({
      where: { id: vocalId },
      include: { group: true }
    });

    if (!vocal) {
      return NextResponse.json({ error: "Vocal no encontrado" }, { status: 404 });
    }

    // Desactivar vocal
    await prisma.groupVocal.update({
      where: { id: vocalId },
      data: { isActive: false }
    });

    // Verificar si el usuario es vocal de otros grupos
    const otherVocalRoles = await prisma.groupVocal.count({
      where: { userId: vocal.userId, isActive: true, id: { not: vocalId } }
    });

    // Si no es vocal de ningún otro grupo, cambiar rol a PADRE
    if (otherVocalRoles === 0) {
      await prisma.user.update({
        where: { id: vocal.userId },
        data: { role: "PADRE" }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing vocal:", error);
    return NextResponse.json({ error: "Error al remover vocal" }, { status: 500 });
  }
}
