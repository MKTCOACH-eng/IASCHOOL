import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

const client = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: 'https://routellm.abacus.ai/v1'
});

const AGE_RANGE_DESCRIPTIONS: Record<string, string> = {
  PRESCHOOL: 'niños de 3 a 5 años (preescolar)',
  EARLY_ELEMENTARY: 'niños de 6 a 8 años (primeros años de primaria)',
  LATE_ELEMENTARY: 'niños de 9 a 11 años (últimos años de primaria)',
  MIDDLE_SCHOOL: 'adolescentes de 12 a 14 años (secundaria)',
  HIGH_SCHOOL: 'adolescentes de 15 a 18 años (preparatoria)',
  ALL_AGES: 'todas las edades'
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  PARENTING: 'consejos de crianza y educación para padres',
  HOMEWORK_HELP: 'estrategias para ayudar con las tareas escolares',
  HEALTH_WELLNESS: 'salud y bienestar infantil/juvenil',
  DIGITAL_SAFETY: 'seguridad digital y uso responsable de tecnología',
  SOCIAL_SKILLS: 'desarrollo de habilidades sociales',
  EMOTIONAL_INTEL: 'inteligencia emocional y manejo de emociones',
  STUDY_HABITS: 'hábitos de estudio efectivos',
  NUTRITION: 'nutrición saludable',
  ACTIVITIES: 'actividades familiares y recreativas',
  SCHOOL_PREP: 'preparación para el éxito escolar'
};

// POST - Generar tips con IA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para generar tips' }, { status: 403 });
    }

    const body = await request.json();
    const { category, ageRange, count = 1, customPrompt } = body;

    if (!category || !ageRange) {
      return NextResponse.json({ error: 'Categoría y rango de edad requeridos' }, { status: 400 });
    }

    const ageDesc = AGE_RANGE_DESCRIPTIONS[ageRange] || ageRange;
    const catDesc = CATEGORY_DESCRIPTIONS[category] || category;

    const systemPrompt = `Eres un experto en educación infantil y desarrollo familiar. Tu tarea es crear contenido educativo de alta calidad para padres de familia en México y Latinoamérica.

Reglas:
1. El contenido debe ser práctico, accionable y basado en evidencia
2. Usa un tono cálido y comprensivo
3. Incluye ejemplos concretos y situaciones reales
4. Evita tecnicismos excesivos
5. El contenido debe ser culturalmente relevante para familias latinoamericanas
6. Estructura el contenido con subtítulos y listas cuando sea apropiado

Formato de respuesta (JSON):
{
  "title": "Título atractivo y descriptivo",
  "summary": "Resumen de 1-2 oraciones",
  "content": "Contenido completo en formato Markdown",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const userPrompt = customPrompt || 
      `Genera ${count} artículo(s) educativo(s) sobre ${catDesc} dirigido a padres con ${ageDesc}. El contenido debe ser útil, informativo y fácil de aplicar en la vida diaria.`;

    const tips = [];
    
    for (let i = 0; i < count; i++) {
      const response = await client.chat.completions.create({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      try {
        // Extraer JSON de la respuesta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        
        const generated = JSON.parse(jsonMatch[0]);
        
        // Generar slug único
        const baseSlug = generated.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const existingCount = await prisma.educationalTip.count({
          where: { slug: { startsWith: baseSlug } }
        });
        
        const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

        // Guardar en base de datos
        const tip = await prisma.educationalTip.create({
          data: {
            title: generated.title,
            slug,
            content: generated.content,
            summary: generated.summary,
            category: category as any,
            ageRange: ageRange as any,
            tags: generated.tags || [],
            isAiGenerated: true,
            aiModel: 'claude-sonnet-4-20250514',
            aiPrompt: userPrompt,
            status: 'PENDING_REVIEW'
          }
        });

        tips.push(tip);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Guardar como borrador si no se puede parsear
        const tip = await prisma.educationalTip.create({
          data: {
            title: `Tip generado - ${new Date().toISOString()}`,
            slug: `tip-${Date.now()}`,
            content,
            category: category as any,
            ageRange: ageRange as any,
            tags: [],
            isAiGenerated: true,
            aiModel: 'claude-sonnet-4-20250514',
            aiPrompt: userPrompt,
            status: 'DRAFT'
          }
        });
        tips.push(tip);
      }
    }

    return NextResponse.json({ tips, generated: tips.length });
  } catch (error) {
    console.error('Error generating tips:', error);
    return NextResponse.json({ error: 'Error al generar tips' }, { status: 500 });
  }
}
