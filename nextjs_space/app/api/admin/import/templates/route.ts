import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Descargar plantillas CSV
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const templates: Record<string, { headers: string[]; example: string[] }> = {
      STUDENTS: {
        headers: ["nombre", "apellido", "grupo", "emailPadre", "nombrePadre", "telefonoPadre"],
        example: ["Juan", "Pérez", "3ro Primaria A", "papa.perez@email.com", "Carlos Pérez", "5551234567"],
      },
      PARENTS: {
        headers: ["nombre", "email", "telefono", "password"],
        example: ["María López", "maria.lopez@email.com", "5559876543", "opcional123"],
      },
      TEACHERS: {
        headers: ["nombre", "email", "telefono", "password", "grupos"],
        example: ["Ana García", "ana.garcia@escuela.edu", "5551112233", "opcional456", "3ro A, 4to B"],
      },
    };

    if (!type || !templates[type]) {
      return NextResponse.json({ error: "Tipo de plantilla no válido" }, { status: 400 });
    }

    const template = templates[type];
    const csv = [template.headers.join(","), template.example.join(",")].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="plantilla_${type.toLowerCase()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
