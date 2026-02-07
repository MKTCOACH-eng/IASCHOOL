import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const { answers, score } = await request.json();
    
    const survey = await db.survey.findUnique({ where: { id: params.id } });
    
    if (!survey || survey.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }
    
    if (survey.status !== 'ACTIVE') {
      return NextResponse.json({ error: "La encuesta no está activa" }, { status: 400 });
    }
    
    // Check if user already responded
    const existing = await db.surveyResponse.findFirst({
      where: { surveyId: params.id, userId: user.id }
    });
    
    if (existing) {
      return NextResponse.json({ error: "Ya respondiste esta encuesta" }, { status: 400 });
    }
    
    // Create response
    const response = await db.surveyResponse.create({
      data: {
        surveyId: params.id,
        userId: survey.isAnonymous ? null : user.id,
        answers,
        score
      }
    });
    
    // Update survey stats
    const allResponses = await db.surveyResponse.findMany({
      where: { surveyId: params.id },
      select: { score: true }
    });
    
    const validScores = allResponses.filter((r: { score: number | null }) => r.score !== null).map((r: { score: number | null }) => r.score as number);
    const avgScore = validScores.length > 0 
      ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length 
      : null;
    
    await db.survey.update({
      where: { id: params.id },
      data: {
        responseCount: allResponses.length,
        averageScore: avgScore
      }
    });
    
    return NextResponse.json({ success: true, response }, { status: 201 });
  } catch (error) {
    console.error("Error responding to survey:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
