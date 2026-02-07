import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions, verifyAuthentication } from '@/lib/webauthn';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Generate authentication options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let userId: string | undefined;
    
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });
      userId = user?.id;
    }

    const options = await generateAuthenticationOptions(userId);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Verify authentication
export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credencial requerida' }, { status: 400 });
    }

    const user = await verifyAuthentication(credential);

    if (!user) {
      return NextResponse.json({ error: 'Autenticación fallida' }, { status: 401 });
    }

    // Get full user data for token
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { school: true }
    });

    if (!fullUser || !fullUser.isActive) {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
    }

    // Create a simple token for client-side use
    // The actual session will be managed by NextAuth
    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        schoolId: fullUser.schoolId,
        schoolName: fullUser.school?.name,
      },
      message: 'Autenticación exitosa con passkey'
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
