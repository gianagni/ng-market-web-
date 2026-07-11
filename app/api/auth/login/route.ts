import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const loginRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // max 5 percobaan login per 15 menit per IP
  prefix: 'login',
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    
    const { success, remaining } = await loginRatelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json(
        { error: 'Email atau password salah', remaining },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, remaining });

  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Kesalahan sistem' }, { status: 500 });
  }
}