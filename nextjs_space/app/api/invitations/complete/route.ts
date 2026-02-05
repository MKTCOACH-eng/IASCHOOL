import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, name, phone, newPassword } = await request.json();

    if (!token || !name || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Find invitation
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

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Esta invitación ya no es válida" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Create user and update invitation in a transaction
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: invitation.role,
          schoolId: invitation.schoolId,
          mustChangePassword: false,
          profileCompleted: true,
          invitationId: invitation.id,
        },
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    });
  } catch (error: unknown) {
    console.error("Error completing enrollment:", error);
    
    // Check for unique constraint violation (user already exists)
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al completar el registro" },
      { status: 500 }
    );
  }
}
