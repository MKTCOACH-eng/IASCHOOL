import { NextRequest, NextResponse } from 'next/server';

// Chat público para el landing page - no requiere autenticación
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    // Llamar a la API de LLM
    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        response: 'Disculpa, el servicio de chat no está disponible en este momento. Por favor escríbenos a ventas@iaschool.mx' 
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
        messages: messages.slice(-10), // Limitar historial
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('LLM API error:', await response.text());
      return NextResponse.json({ 
        response: 'Estoy experimentando dificultades técnicas. Por favor intenta de nuevo o escríbenos a ventas@iaschool.mx' 
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'No pude procesar tu solicitud.';

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ 
      response: 'Error en el servicio de chat. Por favor intenta más tarde.' 
    });
  }
}
