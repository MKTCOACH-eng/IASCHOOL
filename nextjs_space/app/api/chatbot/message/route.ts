import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}

const SYSTEM_PROMPT = `Eres un asistente virtual amigable y profesional para padres de familia del colegio Vermont School. Tu nombre es "Asistente IA School".

Tu objetivo es ayudar a los padres con:
- Consultas sobre pagos y colegiaturas
- Información sobre tareas y actividades de sus hijos
- Fechas de eventos y calendario escolar
- Información sobre horarios y asistencia
- Preguntas frecuentes sobre el colegio
- Trámites administrativos

Reglas importantes:
1. Responde siempre en español de México de manera amable y clara
2. Si no tienes la información específica, sugiere que contacten a la administración del colegio
3. No inventes información de pagos, fechas o calificaciones
4. Mantén las respuestas concisas pero completas
5. Usa un tono cálido y profesional
6. Si te preguntan algo fuera de tema escolar, redirígelos amablemente

Información general del colegio:
- Horario de clases: 7:45 AM - 2:30 PM
- Horario de atención administrativa: 8:00 AM - 4:00 PM
- Los pagos de colegiatura vencen el día 10 de cada mes
- El uniforme es obligatorio todos los días
- Para justificar faltas se requiere comprobante médico

Si el usuario hace una pregunta que requiere información específica de su hijo (calificaciones, tareas pendientes, etc.), indícale que puede consultarlo en la sección correspondiente de la plataforma.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const { conversationId, message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Obtener o crear conversación
    type ConversationWithMessages = {
      id: string;
      userId: string;
      schoolId: string;
      messages: { role: string; content: string }[];
    };
    
    let conversation: ConversationWithMessages;
    if (conversationId) {
      const existingConv = await prisma.chatbotConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20 // Últimos 20 mensajes para contexto
          }
        }
      });

      if (!existingConv) {
        return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
      }
      conversation = existingConv;
    } else {
      conversation = await prisma.chatbotConversation.create({
        data: {
          userId: user.id,
          schoolId: user.schoolId
        },
        include: { messages: true }
      });
    }

    // Guardar mensaje del usuario
    await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    });

    // Construir historial de mensajes para el LLM
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `El usuario se llama ${user.name} y tiene el rol de ${user.role === 'PADRE' ? 'Padre de familia' : user.role}.` },
      ...conversation.messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Llamar al LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Error en la API de LLM');
    }

    // Streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          let partialRead = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Guardar respuesta completa en la base de datos
                  const responseTime = Date.now() - startTime;
                  await prisma.chatbotMessage.create({
                    data: {
                      conversationId: conversation.id,
                      role: 'assistant',
                      content: fullResponse,
                      responseTime
                    }
                  });

                  // Actualizar contador de mensajes
                  await prisma.chatbotConversation.update({
                    where: { id: conversation.id },
                    data: {
                      messageCount: { increment: 2 }, // usuario + asistente
                      updatedAt: new Date()
                    }
                  });

                  // Enviar señal de finalización
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Conversation-Id': conversation.id
      }
    });
  } catch (error) {
    console.error('Error in chatbot message:', error);
    return NextResponse.json(
      { error: 'Error al procesar mensaje' },
      { status: 500 }
    );
  }
}
