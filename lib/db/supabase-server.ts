import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  requireSupabaseEnv,
  SUPABASE_SERVICE_ROLE_KEY,
} from '../env';
import { getLeafViewer } from '@/lib/auth/viewer';

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
  const viewer = await getLeafViewer();
  if (!viewer) return null;
  return {
    id: viewer.session.id,
    email: viewer.session.email,
    user_metadata: {
      is_admin: viewer.isAdmin,
      classmate_id: viewer.classmate?.id ?? null,
      user_id: viewer.classmate?.user_id ?? null,
      name: viewer.classmate?.name ?? viewer.session.username,
    },
  };
}

/**
 * Get the current user AND their classmate record.
 * Returns null if not authenticated or no matching classmate.
 */
export async function getCurrentClassmate() {
  return (await getLeafViewer())?.classmate ?? null;
}
