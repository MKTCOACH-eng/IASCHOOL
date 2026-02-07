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

function verifyAffiliateToken(request: NextRequest): AffiliateToken | null {
  const token = request.cookies.get('affiliate_token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AffiliateToken;
    if (decoded.type !== 'public_affiliate') return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET - Obtener leads del afiliado
export async function GET(request: NextRequest) {
  try {
    const affiliateData = verifyAffiliateToken(request);
    
    if (!affiliateData) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const leads = await prisma.publicAffiliateSchoolLead.findMany({
      where: { affiliateId: affiliateData.affiliateId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}

// POST - Registrar nuevo lead (colegio referido)
export async function POST(request: NextRequest) {
  try {
    const affiliateData = verifyAffiliateToken(request);
    
    if (!affiliateData) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { schoolName, contactName, contactEmail, contactPhone, city, estimatedStudents, notes } = body;

    // Validaciones
    if (!schoolName || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'Nombre del colegio, nombre de contacto y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un lead con ese email de contacto
    const existingLead = await prisma.publicAffiliateSchoolLead.findFirst({
      where: { contactEmail: contactEmail.toLowerCase() }
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Este colegio ya fue registrado por otro afiliado' },
        { status: 400 }
      );
    }

    // Calcular fecha de expiración (30 días desde el registro del colegio)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const lead = await prisma.publicAffiliateSchoolLead.create({
      data: {
        affiliateId: affiliateData.affiliateId,
        schoolName,
        contactName,
        contactEmail: contactEmail.toLowerCase(),
        contactPhone: contactPhone || null,
        city: city || null,
        estimatedStudents: estimatedStudents ? parseInt(estimatedStudents) : null,
        notes: notes || null,
        expiresAt
      }
    });

    // Actualizar contador de referidos del afiliado
    await prisma.publicAffiliate.update({
      where: { id: affiliateData.affiliateId },
      data: { totalReferrals: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: 'Colegio registrado exitosamente',
      lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Error al registrar colegio' },
      { status: 500 }
    );
  }
}
