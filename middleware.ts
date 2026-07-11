import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options) {
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Refresh session — wajib biar cookie auth tetap valid
  const { data: { user } } = await supabase.auth.getUser();

  // Gate khusus untuk path /admin (kecuali halaman MFA-nya sendiri)
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/mfa')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Cek MFA enrollment
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasMfaEnrolled = (factors?.totp?.length ?? 0) > 0;

    if (!hasMfaEnrolled) {
      return NextResponse.redirect(new URL('/admin/mfa-setup', request.url));
    }

    // Cek AAL level (apakah sesi udah ter-challenge dengan TOTP)
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== 'aal2') {
      return NextResponse.redirect(new URL('/admin/mfa-challenge', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};