import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Read Supabase env vars directly — middleware runs in Edge Runtime
 * and cannot use node:fs or process.cwd() from @/lib/env.
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return { url, anonKey };
}

/**
 * Middleware — refreshes Supabase session cookies on every request
 * and protects admin routes.
 *
 * Routes under /admin require an authenticated user with is_admin=true.
 * All other routes are public.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseEnv();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // Refresh the session — this is critical for keeping the auth
  // cookie alive. Without this, sessions expire after 1 hour.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      // Non-admin trying to access /admin → redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
