import { NextResponse } from 'next/server';

// POST - Logout de afiliado
export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('affiliate_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  });

  return response;
}
