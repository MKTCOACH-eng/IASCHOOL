import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST - Registrar nuevo afiliado público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, termsAccepted } = body;

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos del programa de afiliados' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya está registrado
    const existingAffiliate = await prisma.publicAffiliate.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'Este email ya está registrado como afiliado' },
        { status: 400 }
      );
    }

    // Generar código único de afiliado
    const affiliateCode = 'AF' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear afiliado
    const affiliate = await prisma.publicAffiliate.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        hashedPassword,
        affiliateCode,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        affiliateCode: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Ya puedes iniciar sesión.',
      affiliate
    });
  } catch (error) {
    console.error('Error registering affiliate:', error);
    return NextResponse.json(
      { error: 'Error al registrar afiliado' },
      { status: 500 }
    );
  }
}
