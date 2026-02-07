import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

interface SessionUser {
  id: string;
  role: string;
  schoolId?: string;
}

// GET - Listar tips educativos publicados
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const ageRange = searchParams.get('ageRange');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const user = session.user as SessionUser;
    
    const where: Record<string, unknown> = {};
    
    // Solo ADMIN/SUPER_ADMIN pueden ver todos los estados
    if (['ADMIN', 'SUPER_ADMIN'].includes(user.role) && status) {
      where.status = status;
    } else {
      where.status = 'PUBLISHED';
    }

    if (category) where.category = category;
    if (ageRange) where.ageRange = ageRange;

    const tips = await prisma.educationalTip.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    });

    const total = await prisma.educationalTip.count({ where });

    return NextResponse.json({
      tips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json({ error: 'Error al obtener tips' }, { status: 500 });
  }
}

// POST - Crear tip manualmente o aprobar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      summary,
      category,
      ageRange,
      tags = [],
      featuredImageUrl,
      status = 'DRAFT'
    } = body;

    if (!title || !content || !category || !ageRange) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    // Generar slug único
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const existingCount = await prisma.educationalTip.count({
      where: { slug: { startsWith: baseSlug } }
    });
    
    const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

    const tip = await prisma.educationalTip.create({
      data: {
        title,
        slug,
        content,
        summary,
        category,
        ageRange,
        tags,
        featuredImageUrl,
        isAiGenerated: false,
        status: status as any,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        reviewedById: status === 'APPROVED' || status === 'PUBLISHED' ? user.id : null,
        reviewedAt: status === 'APPROVED' || status === 'PUBLISHED' ? new Date() : null
      }
    });

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json({ error: 'Error al crear tip' }, { status: 500 });
  }
}
