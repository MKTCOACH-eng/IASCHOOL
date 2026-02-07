import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - Generar datos para QR de una invitación
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json({ error: "ID de invitación requerido" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        schoolId: user.schoolId,
        status: "PENDING",
      },
      include: {
        school: {
          select: { name: true, code: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
    }

    // Generar URL de enrollment
    const baseUrl = process.env.NEXTAUTH_URL || "https://iaschool.app";
    const enrollUrl = `${baseUrl}/enroll?token=${invitation.token}`;

    // Datos para mostrar junto al QR
    return NextResponse.json({
      enrollUrl,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        schoolCode: invitation.school.code,
        schoolName: invitation.school.name,
        tempPassword: invitation.tempPassword,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error generating QR data:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Generar invitación con QR para enrollment masivo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { emails, role } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Se requiere lista de emails" }, { status: 400 });
    }

    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: { name: true, code: true },
    });

    if (!school) {
      return NextResponse.json({ error: "Escuela no encontrada" }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://iaschool.app";
    const results = [];

    for (const email of emails) {
      // Verificar si ya existe usuario o invitación
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingInvitation = await prisma.invitation.findFirst({
        where: { email, status: "PENDING" },
      });

      if (existingUser || existingInvitation) {
        results.push({ email, status: "skipped", reason: existingUser ? "Usuario ya existe" : "Invitación pendiente" });
        continue;
      }

      // Generar token y contraseña temporal
      const token = crypto.randomUUID();
      const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

      const invitation = await prisma.invitation.create({
        data: {
          email,
          role: role || "PADRE",
          schoolId: user.schoolId,
          token,
          tempPassword,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      });

      results.push({
        email,
        status: "created",
        invitation: {
          id: invitation.id,
          enrollUrl: `${baseUrl}/enroll?token=${token}`,
          schoolCode: school.code,
          tempPassword,
        },
      });
    }

    return NextResponse.json({
      total: emails.length,
      created: results.filter(r => r.status === "created").length,
      skipped: results.filter(r => r.status === "skipped").length,
      results,
    });
  } catch (error) {
    console.error("Error creating batch invitations:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
