import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generateRegistrationOptions, verifyRegistration } from '@/lib/webauthn';

// GET - Generate registration options
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string; name: string; email: string };
    const options = await generateRegistrationOptions(user.id, user.name, user.email);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST - Verify and store registration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as { id: string };
    const { credential, deviceName } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Credencial requerida' }, { status: 400 });
    }

    const passkey = await verifyRegistration(user.id, credential, deviceName);

    return NextResponse.json({
      success: true,
      message: 'Passkey registrado exitosamente',
      passkey: {
        id: passkey.id,
        deviceName: passkey.deviceName,
        createdAt: passkey.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
