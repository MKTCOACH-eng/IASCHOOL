import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  name: string;
  role: string;
  schoolId?: string;
}

// Asistente personal para padres - requiere autenticación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Obtener contexto del usuario
    let contextInfo = '';

    // Información del colegio
    if (user.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: { name: true, phone: true, email: true, address: true }
      });
      if (school) {
        contextInfo += `\nCOLEGIO: ${school.name}\nTel: ${school.phone || 'No disponible'}\nEmail: ${school.email || 'No disponible'}\nDirección: ${school.address || 'No disponible'}\n`;
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
            where: { status: 'PENDING' },
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
          if (child.charges.length > 0) {
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
            const dueDate = new Date(task.dueDate!).toLocaleDateString('es-MX');
            contextInfo += `- ${task.title} (${task.subject?.name || 'Sin materia'}) - Entrega: ${dueDate}\n`;
          });
        }
      }
    }

    // Eventos próximos
    const upcomingEvents = await prisma.event.findMany({
      where: {
        schoolId: user.schoolId,
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: 'asc' },
      take: 5
    });

    if (upcomingEvents.length > 0) {
      contextInfo += '\nEVENTOS PRÓXIMOS:\n';
      upcomingEvents.forEach(event => {
        const date = new Date(event.startDate).toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        contextInfo += `- ${event.title}: ${date}\n`;
      });
    }

    // Construir prompt del sistema
    const systemPrompt = `Eres un asistente personal para padres de familia del colegio. Tu nombre es "Asistente IA School".

INFORMACIÓN DEL CONTEXTO:
${contextInfo}

INSTRUCCIONES:
- Responde siempre en español, de forma amigable y clara
- Usa la información del contexto para responder preguntas específicas
- Si preguntan por días de asueto, revisa los eventos
- Si preguntan por tareas, usa la lista de tareas pendientes
- Si preguntan por pagos, menciona los cargos pendientes
- Si no tienes la información exacta, sugiere contactar al colegio directamente
- Puedes dar información general sobre el colegio usando los datos proporcionados`;

    // Llamar a la API de LLM
    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        response: 'El servicio de asistente no está disponible temporalmente.' 
      });
    }

    const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('LLM API error');
      return NextResponse.json({ 
        response: 'Estoy experimentando dificultades. Por favor inténtalo de nuevo.' 
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'No pude procesar tu solicitud.';

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json({ 
      response: 'Error en el servicio. Por favor inténtalo más tarde.' 
    });
  }
}
