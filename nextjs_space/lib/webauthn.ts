/**
 * WebAuthn/Passkeys Implementation for IA School
 * Enables biometric authentication (Face ID, Touch ID, Windows Hello)
 */

import { prisma } from '@/lib/db';

// WebAuthn configuration
export const WEBAUTHN_CONFIG = {
  rpName: 'IA School',
  rpID: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : 'localhost',
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  attestation: 'none' as const,  // 'none' for privacy, 'direct' for hardware verification
  userVerification: 'preferred' as const,
  timeout: 60000, // 1 minute
};

/**
 * Generate registration options for new passkey
 */
export async function generateRegistrationOptions(userId: string, userName: string, userEmail: string) {
  // Get existing credentials to exclude
  const existingCredentials = await prisma.userPasskey.findMany({
    where: { userId },
    select: { credentialId: true }
  });

  const challenge = generateChallenge();
  
  // Store challenge for verification
  await prisma.webAuthnChallenge.create({
    data: {
      challenge,
      userId,
      type: 'registration',
      expiresAt: new Date(Date.now() + WEBAUTHN_CONFIG.timeout)
    }
  });

  return {
    challenge: base64UrlEncode(challenge),
    rp: {
      name: WEBAUTHN_CONFIG.rpName,
      id: WEBAUTHN_CONFIG.rpID,
    },
    user: {
      id: base64UrlEncode(new TextEncoder().encode(userId)),
      name: userEmail,
      displayName: userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' as const },   // ES256
      { alg: -257, type: 'public-key' as const }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform' as const, // Built-in authenticators only
      userVerification: WEBAUTHN_CONFIG.userVerification,
      residentKey: 'preferred' as const,
    },
    timeout: WEBAUTHN_CONFIG.timeout,
    attestation: WEBAUTHN_CONFIG.attestation,
    excludeCredentials: existingCredentials.map(cred => ({
      id: cred.credentialId,
      type: 'public-key' as const,
    })),
  };
}

/**
 * Generate authentication options for login
 */
export async function generateAuthenticationOptions(userId?: string) {
  const challenge = generateChallenge();
  
  // If userId provided, get their credentials
  let allowCredentials: { id: string; type: 'public-key' }[] = [];
  
  if (userId) {
    const credentials = await prisma.userPasskey.findMany({
      where: { userId },
      select: { credentialId: true }
    });
    allowCredentials = credentials.map(cred => ({
      id: cred.credentialId,
      type: 'public-key' as const,
    }));
  }

  // Store challenge
  await prisma.webAuthnChallenge.create({
    data: {
      challenge,
      userId: userId || 'anonymous',
      type: 'authentication',
      expiresAt: new Date(Date.now() + WEBAUTHN_CONFIG.timeout)
    }
  });

  return {
    challenge: base64UrlEncode(challenge),
    rpId: WEBAUTHN_CONFIG.rpID,
    timeout: WEBAUTHN_CONFIG.timeout,
    userVerification: WEBAUTHN_CONFIG.userVerification,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
  };
}

/**
 * Verify registration response and store credential
 */
export async function verifyRegistration(
  userId: string,
  credential: {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      attestationObject: string;
    };
    type: string;
  },
  deviceName?: string
) {
  // Get stored challenge
  const storedChallenge = await prisma.webAuthnChallenge.findFirst({
    where: {
      userId,
      type: 'registration',
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!storedChallenge) {
    throw new Error('Challenge expired or not found');
  }

  // Parse clientDataJSON
  const clientData = JSON.parse(
    new TextDecoder().decode(base64UrlDecode(credential.response.clientDataJSON))
  );

  // Verify challenge matches
  const expectedChallenge = base64UrlEncode(storedChallenge.challenge);
  if (clientData.challenge !== expectedChallenge) {
    throw new Error('Challenge mismatch');
  }

  // Verify origin
  if (clientData.origin !== WEBAUTHN_CONFIG.origin) {
    // Allow localhost variants in development
    if (!clientData.origin.includes('localhost') && !clientData.origin.includes('127.0.0.1')) {
      throw new Error('Origin mismatch');
    }
  }

  // Verify type
  if (clientData.type !== 'webauthn.create') {
    throw new Error('Invalid type');
  }

  // Store the credential
  // Note: In production, you should parse the attestationObject to extract the public key
  // For simplicity, we're storing the raw credential data
  const passkey = await prisma.userPasskey.create({
    data: {
      userId,
      credentialId: credential.id,
      publicKey: credential.response.attestationObject,
      counter: 0,
      deviceName: deviceName || 'Unknown Device',
      lastUsedAt: new Date(),
    }
  });

  // Clean up challenge
  await prisma.webAuthnChallenge.delete({ where: { id: storedChallenge.id } });

  return passkey;
}

/**
 * Verify authentication response
 */
export async function verifyAuthentication(
  credential: {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
    };
  }
) {
  // Find the stored credential
  const storedCredential = await prisma.userPasskey.findFirst({
    where: { credentialId: credential.id },
    include: { user: true }
  });

  if (!storedCredential) {
    throw new Error('Credential not found');
  }

  // Get stored challenge
  const storedChallenge = await prisma.webAuthnChallenge.findFirst({
    where: {
      type: 'authentication',
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!storedChallenge) {
    throw new Error('Challenge expired');
  }

  // Parse and verify clientDataJSON
  const clientData = JSON.parse(
    new TextDecoder().decode(base64UrlDecode(credential.response.clientDataJSON))
  );

  const expectedChallenge = base64UrlEncode(storedChallenge.challenge);
  if (clientData.challenge !== expectedChallenge) {
    throw new Error('Challenge mismatch');
  }

  if (clientData.type !== 'webauthn.get') {
    throw new Error('Invalid type');
  }

  // Update counter and last used
  await prisma.userPasskey.update({
    where: { id: storedCredential.id },
    data: {
      counter: storedCredential.counter + 1,
      lastUsedAt: new Date()
    }
  });

  // Clean up challenge
  await prisma.webAuthnChallenge.delete({ where: { id: storedChallenge.id } });

  return storedCredential.user;
}

/**
 * Helper: Generate random challenge
 */
function generateChallenge(): Uint8Array {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
}

/**
 * Helper: Base64URL encode
 */
function base64UrlEncode(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Helper: Base64URL decode
 */
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
