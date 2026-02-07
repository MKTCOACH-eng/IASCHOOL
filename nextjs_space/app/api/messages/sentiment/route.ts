import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { Message, Conversation, User, Role } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: "https://api.abacus.ai/llm/v1",
});

interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative" | "concerned";
  confidence: number;
  summary: string;
  topics: string[];
  alerts: string[];
}

type MessageWithSender = Message & { 
  sender: { name: string; role: Role };
  conversation: { name: string | null; type: string } | null;
};

type ConversationSimple = { id: string; type: string; name: string | null };
type UserSimple = { id: string; role: Role };

// POST: Analyze sentiment of messages in a conversation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    
    // Only admins and teachers can analyze sentiment
    if (!['ADMIN', 'PROFESOR', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: "Solo administradores y profesores pueden analizar sentimientos" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { conversationId, messageIds, period } = body;

    // Build query for messages
    let whereClause: Record<string, unknown> = {};
    
    if (conversationId) {
      // Verify user has access to conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { schoolId: user.schoolId },
            { participants: { some: { userId: user.id } } },
          ],
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversación no encontrada o sin acceso" },
          { status: 404 }
        );
      }
      whereClause.conversationId = conversationId;
    } else if (messageIds && Array.isArray(messageIds)) {
      whereClause.id = { in: messageIds };
    } else if (period) {
      // Analyze messages from a time period
      const startDate = new Date();
      if (period === 'day') startDate.setDate(startDate.getDate() - 1);
      else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
      
      whereClause = {
        createdAt: { gte: startDate },
        conversation: { schoolId: user.schoolId },
      };
    } else {
      return NextResponse.json(
        { error: "Debe especificar conversationId, messageIds o period" },
        { status: 400 }
      );
    }

    // Fetch messages
    const messages: MessageWithSender[] = await prisma.message.findMany({
      where: {
        ...whereClause,
        type: 'TEXT', // Only analyze text messages
      },
      include: {
        sender: { select: { name: true, role: true } },
        conversation: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit to prevent too long prompts
    });

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: {
          sentiment: "neutral",
          confidence: 1,
          summary: "No hay mensajes para analizar",
          topics: [],
          alerts: [],
          messageCount: 0,
        },
      });
    }

    // Format messages for analysis
    const messageText = messages
      .map((m: MessageWithSender) => `[${m.sender.role}] ${m.sender.name}: ${m.content}`)
      .join("\n");

    // Call LLM for sentiment analysis
    const prompt = `Analiza el sentimiento y contenido de los siguientes mensajes de una conversación escolar.

Mensajes:
${messageText}

Responde SOLO con un JSON válido (sin markdown ni explicaciones adicionales) con esta estructura:
{
  "sentiment": "positive" | "neutral" | "negative" | "concerned",
  "confidence": 0.0 a 1.0,
  "summary": "Resumen breve del tono general de la conversación",
  "topics": ["lista", "de", "temas", "principales"],
  "alerts": ["mensajes preocupantes o que requieren atención si los hay"]
}

Criterios:
- "positive": Conversación constructiva, colaborativa, satisfacción
- "neutral": Conversación informativa, sin carga emocional particular
- "negative": Quejas, frustración, conflictos
- "concerned": Preocupaciones sobre el bienestar del estudiante, alertas de bullying, etc.

Prioriza detectar alertas sobre:
- Posible bullying o acoso
- Problemas de salud mental
- Conflictos entre padres y escuela
- Preocupaciones académicas severas`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un analista de comunicación escolar especializado en detectar patrones y sentimientos en conversaciones entre padres, profesores y administración escolar. Tu objetivo es identificar áreas de preocupación y el tono general de las comunicaciones.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    let analysis: SentimentResult;
    const content = response.choices[0]?.message?.content || "";
    
    try {
      // Clean response if wrapped in markdown code blocks
      const cleanContent = content.replace(/```json\n?|```\n?/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch {
      // Fallback if parsing fails
      analysis = {
        sentiment: "neutral",
        confidence: 0.5,
        summary: "No se pudo analizar el contenido completamente",
        topics: [],
        alerts: [],
      };
    }

    // Calculate additional statistics
    const senderStats = messages.reduce(
      (acc: Record<string, number>, m: MessageWithSender) => {
        const role = m.sender.role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        messageCount: messages.length,
        period: {
          start: messages[0]?.createdAt,
          end: messages[messages.length - 1]?.createdAt,
        },
        participantStats: senderStats,
        conversationType: messages[0]?.conversation?.type,
      },
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Error al analizar sentimientos" },
      { status: 500 }
    );
  }
}

// GET: Get sentiment analysis summary for school
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string; schoolId: string };
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: "Solo administradores pueden ver el resumen" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week';

    // Calculate date range
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

    // Get message statistics
    const messageStats = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        createdAt: { gte: startDate },
        conversation: { schoolId: user.schoolId },
        type: 'TEXT',
      },
      _count: { id: true },
    });

    // Get conversation types
    const conversations: ConversationSimple[] = await prisma.conversation.findMany({
      where: {
        id: { in: messageStats.map((s: { conversationId: string }) => s.conversationId) },
      },
      select: { id: true, type: true, name: true },
    });

    const typeStats = conversations.reduce(
      (acc: Record<string, number>, c: ConversationSimple) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get active participants
    const activeParticipants = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        createdAt: { gte: startDate },
        conversation: { schoolId: user.schoolId },
      },
      _count: { id: true },
    });

    // Get users for role breakdown
    const users: UserSimple[] = await prisma.user.findMany({
      where: {
        id: { in: activeParticipants.map((p: { senderId: string }) => p.senderId) },
      },
      select: { id: true, role: true },
    });

    const roleStats = users.reduce(
      (acc: Record<string, number>, u: UserSimple) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      stats: {
        period: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          label: period,
        },
        totalMessages: messageStats.reduce((sum: number, s: { _count: { id: number } }) => sum + s._count.id, 0),
        activeConversations: messageStats.length,
        conversationTypes: typeStats,
        activeParticipants: activeParticipants.length,
        participantRoles: roleStats,
      },
    });
  } catch (error) {
    console.error("Error getting sentiment stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
