export const runtime = 'edge'

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ success: data.success });

  } catch (error) {
    console.error('Captcha verify error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
