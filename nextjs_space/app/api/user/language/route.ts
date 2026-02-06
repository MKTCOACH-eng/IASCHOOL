import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener preferencia de idioma del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    const preference = await prisma.userLanguagePreference.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({
      language: preference?.language || 'ES'
    });
  } catch (error) {
    console.error('Error fetching language preference:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Guardar preferencia de idioma del usuario
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { language } = await request.json();

    // Validar idioma
    const validLanguages = ['ES', 'EN', 'PT', 'DE', 'FR', 'JA'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ error: 'Idioma no válido' }, { status: 400 });
    }

    // Upsert preferencia de idioma
    const preference = await prisma.userLanguagePreference.upsert({
      where: { userId: user.id },
      update: { language },
      create: {
        userId: user.id,
        language
      }
    });

    return NextResponse.json({
      success: true,
      language: preference.language
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
