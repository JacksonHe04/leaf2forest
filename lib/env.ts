/**
 * Environment loader + accessors.
 *
 * Why this is non-trivial:
 *  - `.env.local` historically stored the three Supabase credentials as
 *    *bare values* (one line each, no `KEY=value` prefix). Standard dotenv
 *    loaders silently drop those, so we read the file ourselves and inject
 *    them under stable names.
 *  - We then expose them under both the legacy prefixed form Supabase's
 *    REST server expects (`sb_publishable_*`, `sb_secret_*`) and the
 *    conventional names (NEXT_PUBLIC_SUPABASE_URL, etc.).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RAW_FILE = join(ROOT, '.env.local');

interface BareCreds {
  url?: string;
  publishable?: string;
  secret?: string;
}

function readBareEnv(file: string): BareCreds {
  if (!existsSync(file)) return {};
  const out: BareCreds = {};
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.includes('=')) continue; // standard kv pair, dotenv handles it
    if (line.startsWith('sb_publishable_')) {
      out.publishable = line.slice('sb_publishable_'.length);
    } else if (line.startsWith('sb_secret_')) {
      out.secret = line.slice('sb_secret_'.length);
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      out.url = line;
    }
  }
  return out;
}

const BARE = readBareEnv(RAW_FILE);

if (BARE.url && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = BARE.url;
  process.env.NEXT_PUBLIC_SUPABASE_URL = BARE.url;
}
if (BARE.publishable && !process.env.SUPABASE_PUBLISHABLE_KEY) {
  process.env.SUPABASE_PUBLISHABLE_KEY = BARE.publishable;
  // Construct the full key the Supabase REST endpoint expects.
  process.env.SUPABASE_ANON_KEY = `sb_publishable_${BARE.publishable}`;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = `sb_publishable_${BARE.publishable}`;
}
if (BARE.secret && !process.env.SUPABASE_SECRET_KEY) {
  process.env.SUPABASE_SECRET_KEY = BARE.secret;
  process.env.SUPABASE_SERVICE_ROLE_KEY = `sb_secret_${BARE.secret}`;
}

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

export const SUPABASE_URL = pick(
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL'
);

export const SUPABASE_ANON_KEY = pick(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY'
);

export const SUPABASE_SERVICE_ROLE_KEY = pick(
  'SUPABASE_SERVICE_ROLE_KEY'
);

export function requireSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      '缺少 Supabase 环境变量。请在 .env.local 设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY（或裸 URL / sb_publishable_* / sb_secret_* 行）。'
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
