'use client';

import { createBrowserClient } from '@supabase/ssr';
import {
  requireSupabaseEnv,
} from '../env';

/**
 * Browser-side Supabase client with session persistence.
 *
 * Use this in Client Components for auth operations like
 * sign out, password change, etc.
 *
 * MUST be called in a Client Component context (has 'use client').
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
