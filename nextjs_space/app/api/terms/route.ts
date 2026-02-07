import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { TermsType } from '@prisma/client';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Obtener términos activos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const schoolId = searchParams.get('schoolId');

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { schoolId: null }, // Términos globales
        ...(schoolId ? [{ schoolId }] : [])
      ]
    };

    if (type) {
      where.type = type as TermsType;
    }

    const terms = await prisma.termsAndConditions.findMany({
      where,
      orderBy: [{ type: 'asc' }, { version: 'desc' }]
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json({ error: 'Error al obtener términos' }, { status: 500 });
  }
}

// POST - Crear términos (solo SUPER_ADMIN o ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Solo SUPER_ADMIN puede crear términos globales
    // ADMIN puede crear términos específicos de su colegio
    const body = await request.json();
    const { type, version, title, content, summary, schoolId, isMandatory } = body;

    if (!type || !version || !title || !content) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Validar permisos
    if (!schoolId && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede crear términos globales' }, { status: 403 });
    }

    if (schoolId && user.role === 'ADMIN' && user.schoolId !== schoolId) {
      return NextResponse.json({ error: 'No autorizado para este colegio' }, { status: 403 });
    }

    // Desactivar versiones anteriores del mismo tipo
    await prisma.termsAndConditions.updateMany({
      where: {
        type,
        schoolId: schoolId || null,
        isActive: true
      },
      data: { isActive: false }
    });

    const terms = await prisma.termsAndConditions.create({
      data: {
        type,
        version,
        title,
        content,
        summary,
        schoolId,
        isMandatory: isMandatory !== false
      }
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error creating terms:', error);
    return NextResponse.json({ error: 'Error al crear términos' }, { status: 500 });
  }
}
