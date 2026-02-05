import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getFileUrl } from "@/lib/s3";

// GET - Obtener URL del archivo para descarga/visualización
export async function GET(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cloud_storage_path = decodeURIComponent(params.path);
    
    // Determinar si es público o privado basado en el path
    const isPublic = cloud_storage_path.includes("/public/");
    
    // Obtener URL firmada o pública
    const url = await getFileUrl(cloud_storage_path, isPublic);
    
    // Redirigir al usuario a la URL del archivo
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error getting file:", error);
    return NextResponse.json(
      { error: "Error al obtener archivo" },
      { status: 500 }
    );
  }
}
