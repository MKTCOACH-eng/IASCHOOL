import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, schoolCode, tempPassword } = await request.json();

    if (!token || !schoolCode || !tempPassword) {
      return NextResponse.json(
        { error: "Token, código de colegio y contraseña temporal son requeridos" },
        { status: 400 }
      );
    }

    // Find invitation by token
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { school: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // Validate school code
    if (invitation.school.code.toUpperCase() !== schoolCode.toUpperCase()) {
      return NextResponse.json(
        { error: "Código de colegio incorrecto" },
        { status: 400 }
      );
    }

    // Validate temp password
    if (invitation.tempPassword !== tempPassword) {
      return NextResponse.json(
        { error: "Contraseña temporal incorrecta" },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Esta invitación ya fue utilizada" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > invitation.expiresAt) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        schoolName: invitation.school.name,
        schoolId: invitation.schoolId,
      },
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Error al validar la invitación" },
      { status: 500 }
    );
  }
}
