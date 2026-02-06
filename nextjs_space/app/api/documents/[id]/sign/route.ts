import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

interface StudentWithParents {
  id: string;
  userId: string | null;
  parents: { id: string }[];
}

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string;
}

// POST - Firmar documento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    const body = await request.json();
    const { signatureData, signatureType } = body;

    // Obtener el documento
    const document = await prisma.document.findFirst({
      where: {
        id,
        schoolId: user.schoolId
      },
      include: {
        signatures: true,
        group: {
          include: {
            students: {
              include: { parents: true }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar estado del documento
    if (document.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Este documento aún no está disponible para firma' },
        { status: 400 }
      );
    }

    if (document.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Este documento ya está completamente firmado' },
        { status: 400 }
      );
    }

    if (document.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Este documento ha sido cancelado' },
        { status: 400 }
      );
    }

    if (document.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Este documento ha expirado' },
        { status: 400 }
      );
    }

    // Verificar si ya firmó
    const existingSignature = document.signatures.find((sig: { userId: string }) => sig.userId === user.id);
    if (existingSignature) {
      return NextResponse.json(
        { error: 'Ya has firmado este documento' },
        { status: 400 }
      );
    }

    // Verificar fecha de expiración
    if (document.expiresAt && new Date() > document.expiresAt) {
      await prisma.document.update({
        where: { id },
        data: { status: 'EXPIRED' }
      });
      return NextResponse.json(
        { error: 'El plazo para firmar este documento ha expirado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario puede firmar este documento
    let canSign = false;
    
    // Admin siempre puede firmar sus propios documentos (ej: para pruebas)
    if (user.role === 'ADMIN') {
      canSign = true;
    }
    // Si el documento es para un rol específico
    else if (document.targetRole && document.targetRole === user.role) {
      canSign = true;
    }
    // Si el documento es para un grupo específico
    else if (document.groupId && document.group) {
      // Verificar si el usuario es padre de un estudiante del grupo
      const isParentInGroup = document.group.students.some((student: StudentWithParents) =>
        student.parents.some((parent: { id: string }) => parent.id === user.id)
      );
      // O si es estudiante en el grupo
      const isStudentInGroup = document.group.students.some((student: StudentWithParents) =>
        student.userId === user.id
      );
      canSign = isParentInGroup || isStudentInGroup;
    }
    // Si el documento no tiene restricciones específicas
    else if (!document.targetRole && !document.groupId) {
      canSign = true;
    }

    if (!canSign) {
      return NextResponse.json(
        { error: 'No tienes permiso para firmar este documento' },
        { status: 403 }
      );
    }

    // Obtener IP y User Agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generar código de verificación único
    const verificationCode = crypto.randomBytes(16).toString('hex');

    // Crear la firma
    const signature = await prisma.documentSignature.create({
      data: {
        documentId: id,
        userId: user.id,
        signatureData: signatureData || null,
        signatureType: signatureType || 'ACCEPT',
        ipAddress,
        userAgent,
        verificationCode
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Determinar si actualizar el estado del documento
    const totalSignatures = document.signatures.length + 1;
    
    // Calcular cuántas firmas se esperan
    let expectedSignatures = 0;
    
    if (document.groupId && document.group) {
      // Contar padres únicos en el grupo
      const uniqueParents = new Set<string>();
      document.group.students.forEach((student: StudentWithParents) => {
        student.parents.forEach((parent: { id: string }) => uniqueParents.add(parent.id));
      });
      expectedSignatures = uniqueParents.size;
    } else if (document.targetRole) {
      // Contar usuarios con ese rol en la escuela
      const usersCount = await prisma.user.count({
        where: {
          schoolId: user.schoolId,
          role: document.targetRole as 'ADMIN' | 'PROFESOR' | 'PADRE' | 'ALUMNO' | 'VOCAL'
        }
      });
      expectedSignatures = usersCount;
    }

    // Actualizar estado del documento
    let newStatus: string = document.status;
    if (expectedSignatures > 0 && totalSignatures >= expectedSignatures) {
      newStatus = 'COMPLETED';
    } else if (totalSignatures > 0 && document.status === 'PENDING') {
      newStatus = 'PARTIALLY_SIGNED';
    }

    if (newStatus !== document.status) {
      await prisma.document.update({
        where: { id },
        data: {
          status: newStatus as 'COMPLETED' | 'PARTIALLY_SIGNED',
          completedAt: newStatus === 'COMPLETED' ? new Date() : null
        }
      });
    }

    return NextResponse.json({
      message: 'Documento firmado exitosamente',
      signature: {
        id: signature.id,
        verificationCode: signature.verificationCode,
        signedAt: signature.signedAt
      },
      documentStatus: newStatus
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Error al firmar documento' },
      { status: 500 }
    );
  }
}
