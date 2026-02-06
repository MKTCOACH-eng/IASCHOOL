import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Verificar firma por código
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Código de verificación requerido' },
        { status: 400 }
      );
    }

    const signature = await prisma.documentSignature.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        document: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            school: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!signature) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Código de verificación no encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      signature: {
        id: signature.id,
        signedAt: signature.signedAt,
        signatureType: signature.signatureType,
        signer: {
          name: signature.user.name,
          email: signature.user.email,
          role: signature.user.role
        },
        document: {
          id: signature.document.id,
          title: signature.document.title,
          type: signature.document.type,
          status: signature.document.status,
          createdAt: signature.document.createdAt,
          schoolName: signature.document.school.name
        }
      }
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { error: 'Error al verificar firma' },
      { status: 500 }
    );
  }
}
