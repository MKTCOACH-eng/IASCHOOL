import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Document, DocumentSignature, User, Group } from '@prisma/client';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// GET - Listar documentos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const view = searchParams.get('view'); // 'pending' para docs pendientes de firma

    // Base query
    const where: Record<string, unknown> = {
      schoolId: user.schoolId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Para usuarios no-admin, filtrar por documentos que les corresponden
    if (user.role !== 'ADMIN') {
      // Solo documentos PENDING o COMPLETED, no DRAFT
      where.status = { in: ['PENDING', 'PARTIALLY_SIGNED', 'COMPLETED'] };
      
      // Filtrar por rol del usuario o grupo del usuario
      const userGroups = await prisma.student.findMany({
        where: {
          OR: [
            { parents: { some: { id: user.id } } },
            { userId: user.id }
          ]
        },
        select: { groupId: true }
      });

      const groupIds = userGroups.map((s: { groupId: string | null }) => s.groupId).filter(Boolean) as string[];

      where.OR = [
        { targetRole: user.role as string },
        { targetRole: null, groupId: null }, // Documentos para todos
        { groupId: { in: groupIds } }
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        },
        signatures: {
          select: {
            id: true,
            userId: true,
            signedAt: true,
            verificationCode: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { signatures: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Agregar información de si el usuario actual ya firmó
    type DocumentWithRelations = typeof documents[number];
    const documentsWithUserStatus = documents.map((doc: DocumentWithRelations) => {
      const userSigned = doc.signatures.some((sig: { userId: string }) => sig.userId === user.id);
      return {
        ...doc,
        userSigned,
        signatureCount: doc._count.signatures
      };
    });

    // Filtrar solo pendientes de firma si se solicita
    if (view === 'pending' && user.role !== 'ADMIN') {
      return NextResponse.json(
        documentsWithUserStatus.filter((doc: { userSigned: boolean; status: string }) => !doc.userSigned && doc.status !== 'COMPLETED')
      );
    }

    return NextResponse.json(documentsWithUserStatus);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}

// POST - Crear documento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    
    // Solo ADMIN puede crear documentos
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear documentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, content, type, targetRole, groupId, expiresAt, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Validar grupo si se proporciona
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: { id: groupId, schoolId: user.schoolId }
      });
      if (!group) {
        return NextResponse.json(
          { error: 'Grupo no encontrado' },
          { status: 404 }
        );
      }
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        content,
        type: type || 'AUTORIZACION',
        targetRole: targetRole || null,
        groupId: groupId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: status || 'DRAFT',
        schoolId: user.schoolId,
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Error al crear documento' },
      { status: 500 }
    );
  }
}
