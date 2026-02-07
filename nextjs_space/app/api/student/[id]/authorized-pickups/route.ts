import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: { id: string };
}

// GET - Listar personas autorizadas de un estudiante
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = params.id;

    // Verificar acceso al estudiante
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { select: { id: true } },
      },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Padres pueden ver autorizados de sus hijos
    // Admin con RECEPCION o DIRECCION pueden ver todos
    const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
    const adminSubRoles = user.adminSubRoles || [];
    const isAuthorizedAdmin = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("RECEPCION") ||
      adminSubRoles.includes("DIRECCION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!isParent && !isAuthorizedAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const authorizedPickups = await prisma.authorizedPickup.findMany({
      where: { studentId },
      include: {
        vehicles: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(authorizedPickups);
  } catch (error) {
    console.error("Error fetching authorized pickups:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear persona autorizada
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const studentId = params.id;

    // Verificar acceso al estudiante
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { select: { id: true } },
      },
    });

    if (!student || student.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Padres pueden agregar autorizados a sus hijos
    // Admin con RECEPCION o DIRECCION pueden agregar
    const isParent = student.parents.some((p: { id: string }) => p.id === user.id);
    const adminSubRoles = user.adminSubRoles || [];
    const isAuthorizedAdmin = 
      user.role === "SUPER_ADMIN" ||
      adminSubRoles.includes("RECEPCION") ||
      adminSubRoles.includes("DIRECCION") ||
      (user.role === "ADMIN" && adminSubRoles.length === 0);

    if (!isParent && !isAuthorizedAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const {
      fullName,
      relationship,
      relationshipOther,
      phone,
      email,
      idType,
      idNumber,
      photoUrl,
      idDocumentUrl,
      canPickupAlone,
      requiresIdVerification,
      activeUntil,
      notes,
      vehicles,
    } = body;

    if (!fullName || !relationship || !phone) {
      return NextResponse.json(
        { error: "Nombre, parentesco y teléfono son requeridos" },
        { status: 400 }
      );
    }

    const authorizedPickup = await prisma.authorizedPickup.create({
      data: {
        studentId,
        fullName,
        relationship,
        relationshipOther: relationshipOther || null,
        phone,
        email: email || null,
        idType: idType || null,
        idNumber: idNumber || null,
        photoUrl: photoUrl || null,
        idDocumentUrl: idDocumentUrl || null,
        canPickupAlone: canPickupAlone !== false,
        requiresIdVerification: requiresIdVerification !== false,
        activeUntil: activeUntil ? new Date(activeUntil) : null,
        notes: notes || null,
        vehicles: vehicles?.length
          ? {
              create: vehicles.map((v: any) => ({
                make: v.make,
                model: v.model,
                year: v.year || null,
                color: v.color,
                licensePlate: v.licensePlate,
                photoUrl: v.photoUrl || null,
                notes: v.notes || null,
              })),
            }
          : undefined,
      },
      include: {
        vehicles: true,
      },
    });

    return NextResponse.json(authorizedPickup, { status: 201 });
  } catch (error) {
    console.error("Error creating authorized pickup:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
