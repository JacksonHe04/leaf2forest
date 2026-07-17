import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  requireSupabaseEnv,
  SUPABASE_SERVICE_ROLE_KEY,
} from '../env';

/**
 * Server-side client. Uses the service-role key so it can bypass RLS.
 * MUST NOT be imported into Client Components.
 */
let cachedAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;
  const { url } = requireSupabaseEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('缺少 SUPABASE_SERVICE_ROLE_KEY');
  }
  cachedAdmin = createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return cachedAdmin;
}

/**
 * Browser / RSC public client. Uses the anon (publishable) key.
 * Safe to import into Client Components; reads NEXT_PUBLIC_SUPABASE_*.
 */
let cachedAnon: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedAnon) return cachedAnon;
  const { url, anonKey } = requireSupabaseEnv();
  cachedAnon = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cachedAnon;
}
