import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'affiliate-secret-key';

interface AffiliateToken {
  affiliateId: string;
  email: string;
  affiliateCode: string;
  type: string;
}

// GET - Obtener datos del afiliado autenticado
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('affiliate_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    let decoded: AffiliateToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as AffiliateToken;
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    if (decoded.type !== 'public_affiliate') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const affiliate = await prisma.publicAffiliate.findUnique({
      where: { id: decoded.affiliateId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        affiliateCode: true,
        hasChildrenInSchool: true,
        status: true,
        totalReferrals: true,
        successfulReferrals: true,
        totalEarnings: true,
        pendingEarnings: true,
        createdAt: true
      }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Afiliado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos' },
      { status: 500 }
    );
  }
}
