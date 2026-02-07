import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
  name?: string;
}

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

// POST - Asistente personal para padres
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Construir contexto personalizado
    let contextInfo = `Usuario: ${user.name || 'Usuario'} (${user.role})\n`;
    
    // Obtener información del colegio
    if (user.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: { name: true, phone: true, email: true }
      });
      if (school) {
        contextInfo += `Colegio: ${school.name}\nTel: ${school.phone || 'No disponible'}\nEmail: ${school.email || 'No disponible'}\n`;
      }
    }

    // Si es padre, obtener info de sus hijos
    if (user.role === 'PADRE') {
      const children = await prisma.student.findMany({
        where: { parents: { some: { id: user.id } } },
        include: {
          group: {
            include: {
              teacher: { select: { name: true, email: true } }
            }
          },
          charges: {
            where: { status: 'PENDIENTE' },
            take: 5
          }
        }
      });

      if (children.length > 0) {
        contextInfo += '\nHIJOS DEL PADRE:\n';
        for (const child of children) {
          contextInfo += `- ${child.firstName} ${child.lastName}`;
          if (child.group) {
            contextInfo += ` (Grupo: ${child.group.name})`;
            if (child.group.teacher) {
              contextInfo += ` - Maestro(a): ${child.group.teacher.name}`;
            }
          }
          contextInfo += '\n';

          // Pagos pendientes
          if (child.charges && child.charges.length > 0) {
            contextInfo += `  Pagos pendientes: ${child.charges.length}\n`;
          }
        }

        // Tareas pendientes
        const pendingTasks = await prisma.task.findMany({
          where: {
            group: {
              students: { some: { parents: { some: { id: user.id } } } }
            },
            status: 'PUBLISHED',
            dueDate: { gte: new Date() }
          },
          include: { subject: true, group: true },
          orderBy: { dueDate: 'asc' },
          take: 5
        });

        if (pendingTasks.length > 0) {
          contextInfo += '\nTAREAS PENDIENTES:\n';
          pendingTasks.forEach(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-MX') : 'Sin fecha';
            contextInfo += `- ${task.title} (${task.subject?.name || 'Sin materia'}) - Entrega: ${dueDate}\n`;
          });
        }
      }
    }

    // Eventos próximos
    if (user.schoolId) {
      const upcomingEvents = await prisma.event.findMany({
        where: {
          schoolId: user.schoolId,
          startDate: { gte: new Date() }
        },
        orderBy: { startDate: 'asc' },
        take: 3
      });

      if (upcomingEvents.length > 0) {
        contextInfo += '\nEVENTOS PRÓXIMOS:\n';
        upcomingEvents.forEach(event => {
          const dateStr = new Date(event.startDate).toLocaleDateString('es-MX');
          contextInfo += `- ${event.title} (${dateStr})\n`;
        });
      }
    }

    const systemPrompt = `Eres un asistente personal amigable para padres de familia en una escuela. Tu nombre es "Asistente IA School".

Tienes acceso a la siguiente información del usuario:
${contextInfo}

Tu rol es:
1. Responder preguntas sobre el colegio, horarios, tareas y eventos
2. Ayudar con dudas sobre pagos y cargos pendientes
3. Proporcionar información de contacto de maestros
4. Recordar fechas importantes y plazos de entrega
5. Ser amable, empático y profesional

Si no tienes la información solicitada, sugiere que el padre contacte directamente al colegio o al maestro correspondiente.

Responde siempre en español de forma concisa y útil.`;

    const response = await client.chat.completions.create({
      model: 'claude-sonnet-4-20250514',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud. Inténtalo de nuevo.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in assistant chatbot:', error);
    return NextResponse.json({ error: 'Error al procesar mensaje' }, { status: 500 });
  }
}
