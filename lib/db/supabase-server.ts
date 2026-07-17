import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  requireSupabaseEnv,
  SUPABASE_SERVICE_ROLE_KEY,
} from '../env';

/**
 * Server-side Supabase client with cookie-based session support.
 *
 * Use this in Server Components, Server Actions, and Route Handlers
 * where you need to read the authenticated user's session.
 *
 * Uses the anon key — respects RLS. For admin operations that
 * bypass RLS, use getSupabaseAdmin() from ./supabase.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Server-side admin client with cookie-based session support.
 *
 * Uses the service-role key (bypasses RLS). Use sparingly —
 * only for operations that genuinely need admin access.
 */
export async function createSupabaseAdminServerClient() {
  const { url } = requireSupabaseEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('缺少 SUPABASE_SERVICE_ROLE_KEY');
  }
  const cookieStore = await cookies();

  return createServerClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the current user AND their classmate record.
 * Returns null if not authenticated or no matching classmate.
 */
export async function getCurrentClassmate() {
  const user = await getCurrentUser();
  if (!user) return null;

  const classmateId = user.user_metadata?.classmate_id as string | undefined;
  if (!classmateId) return null;

  const { getClassmate } = await import('./classmates');
  return await getClassmate(classmateId);
}
