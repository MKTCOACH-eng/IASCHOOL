import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'affiliate-secret-key';

// POST - Login de afiliado público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar afiliado
    const affiliate = await prisma.publicAffiliate.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, affiliate.hashedPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que no esté suspendido
    if (affiliate.status === 'SUSPENDED' || affiliate.status === 'INACTIVE') {
      return NextResponse.json(
        { error: 'Tu cuenta de afiliado está suspendida o inactiva' },
        { status: 403 }
      );
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        affiliateId: affiliate.id,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        type: 'public_affiliate'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        totalReferrals: affiliate.totalReferrals,
        successfulReferrals: affiliate.successfulReferrals,
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings
      },
      token
    });

    // Set cookie con el token
    response.cookies.set('affiliate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error in affiliate login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
