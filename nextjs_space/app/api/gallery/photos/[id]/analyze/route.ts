import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: "https://api.abacus.ai/v0/openai"
});

interface FaceDetectionResult {
  faces: {
    studentId: string | null;
    studentName: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }[];
}

// Analyze photo for facial recognition
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "PROFESOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Get the photo
    const photo = await db.photo.findUnique({
      where: { id: params.id },
      include: {
        album: { select: { schoolId: true } },
        tags: true
      }
    });

    if (!photo) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    // Get students with profile photos from this school
    const students = await db.student.findMany({
      where: {
        schoolId: photo.album.schoolId,
        photoUrl: { not: null },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ 
        error: "No hay estudiantes con fotos de perfil para comparar. Por favor, sube fotos de perfil de los estudiantes primero.",
        needsProfiles: true 
      }, { status: 400 });
    }

    // Build the prompt with student reference photos
    const studentsList = students.map(s => 
      `- ID: ${s.id}, Nombre: ${s.firstName} ${s.lastName}`
    ).join("\n");

    // Create image content array for the LLM
    const imageContent: any[] = [
      {
        type: "text",
        text: `Eres un sistema de reconocimiento facial escolar. Analiza la foto principal y detecta los rostros presentes.

Estudiantes registrados con foto de perfil:
${studentsList}

Primero te mostraré las fotos de perfil de referencia de cada estudiante, y luego la foto principal a analizar.

FOTOS DE REFERENCIA DE ESTUDIANTES:`
      }
    ];

    // Add student profile photos as reference
    for (const student of students) {
      if (student.photoUrl) {
        imageContent.push({
          type: "text",
          text: `\n--- Foto de perfil de ${student.firstName} ${student.lastName} (ID: ${student.id}) ---`
        });
        imageContent.push({
          type: "image_url",
          image_url: { url: student.photoUrl }
        });
      }
    }

    // Add the main photo to analyze
    imageContent.push({
      type: "text",
      text: `\n\n--- FOTO PRINCIPAL A ANALIZAR ---\nIdentifica todos los rostros en esta foto y compáralos con las fotos de referencia de arriba:`
    });
    imageContent.push({
      type: "image_url",
      image_url: { url: photo.url }
    });

    imageContent.push({
      type: "text",
      text: `\n\nResponde ÚNICAMENTE con un JSON válido (sin markdown ni texto adicional) con este formato exacto:
{
  "faces": [
    {
      "studentId": "ID_DEL_ESTUDIANTE o null si no lo reconoces",
      "studentName": "Nombre del estudiante o null",
      "x": 0.25,
      "y": 0.15,
      "width": 0.12,
      "height": 0.18,
      "confidence": 0.85
    }
  ]
}

Notas importantes:
- x, y, width, height son porcentajes (0-1) de la posición del rostro en la imagen
- confidence es un valor entre 0 y 1 indicando qué tan seguro estás de la identificación
- Solo incluye estudiantes de la lista si estás razonablemente seguro (confidence > 0.6)
- Si detectas un rostro pero no lo reconoces, usa studentId: null
- Responde SOLO con el JSON, sin explicaciones adicionales`
    });

    // Call the LLM with vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: imageContent
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    
    // Parse the JSON response
    let result: FaceDetectionResult;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Error parsing LLM response:", responseText);
      return NextResponse.json({ 
        error: "Error al procesar la respuesta del análisis",
        rawResponse: responseText 
      }, { status: 500 });
    }

    // Create tags for recognized faces
    const createdTags = [];
    const existingStudentIds = photo.tags.map(t => t.studentId);

    for (const face of result.faces) {
      // Skip if already tagged or if student not recognized
      if (!face.studentId) continue;
      if (existingStudentIds.includes(face.studentId)) continue;
      
      // Verify student exists
      const studentExists = students.find(s => s.id === face.studentId);
      if (!studentExists) continue;

      // Create the tag
      const tag = await db.photoTag.create({
        data: {
          photoId: params.id,
          studentId: face.studentId,
          x: face.x,
          y: face.y,
          width: face.width,
          height: face.height,
          confidence: face.confidence,
          isManual: false
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } }
        }
      });
      createdTags.push(tag);
    }

    // Mark photo as processed
    await db.photo.update({
      where: { id: params.id },
      data: { isProcessed: true }
    });

    return NextResponse.json({
      success: true,
      facesDetected: result.faces.length,
      tagsCreated: createdTags.length,
      tags: createdTags,
      allFaces: result.faces
    });

  } catch (error) {
    console.error("Error analyzing photo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
