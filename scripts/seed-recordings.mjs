#!/usr/bin/env node
/**
 * One-shot seed: uploads every .wav under data/recordings/ into the
 * Supabase `recordings` bucket and inserts a `recordings` row per file.
 *
 * Idempotent by `audio_path`: re-running the script will skip names
 * already present in the bucket.
 *
 * Usage:
 *   node scripts/seed-recordings.mjs           # uploads everything
 *   node scripts/seed-recordings.mjs --limit=5
 *   node scripts/seed-recordings.mjs --dry-run
 *
 * Required env (loaded from .env.local manually below):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// ---- dotenv-lite -----------------------------------------------------------
// `.env.local` historically holds the three Supabase credentials as bare lines
// (URL, sb_publishable_*, sb_secret_*) with no KEY=value prefix. Standard
// dotenv loaders won't pick those up; we read them ourselves.
async function loadEnv(file) {
  try {
    const txt = await readFile(file, 'utf8');
    const lines = txt.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.includes('=')) {
        const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+?)\s*$/i);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
        continue;
      }
      if (line.startsWith('sb_publishable_') && !process.env.SUPABASE_PUBLISHABLE_KEY) {
        process.env.SUPABASE_PUBLISHABLE_KEY = line.slice('sb_publishable_'.length);
      } else if (line.startsWith('sb_secret_') && !process.env.SUPABASE_SECRET_KEY) {
        process.env.SUPABASE_SECRET_KEY = line.slice('sb_secret_'.length);
      } else if ((line.startsWith('http://') || line.startsWith('https://')) && !process.env.SUPABASE_URL) {
        process.env.SUPABASE_URL = line;
      }
    }
  } catch {
    /* missing .env.local is OK */
  }
}
await loadEnv('.env.local');

if (process.env.SUPABASE_PUBLISHABLE_KEY) {
  process.env.SUPABASE_ANON_KEY ??= `sb_publishable_${process.env.SUPABASE_PUBLISHABLE_KEY}`;
}
if (process.env.SUPABASE_SECRET_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= `sb_secret_${process.env.SUPABASE_SECRET_KEY}`;
}

// ---- args ------------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  })
);
const DRY = !!args['dry-run'];
const LIMIT = args.limit ? parseInt(args.limit) : Infinity;
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const DATA = path.join(ROOT, 'data', 'recordings');

// ---- client ----------------------------------------------------------------
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = 'recordings';

async function listObjects() {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(undefined, { limit: 1000 });
  if (error) throw error;
  return new Set((data ?? []).map((o) => o.name));
}

function randomKey(ext) {
  const hex = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  return `audio-${hex}.${ext}`;
}

// Match an 8-digit run at end of filename (e.g. "20220124") as YYYYMMDD.
function parseDateFromName(name) {
  const m = name.match(/(\d{8})(?=\.[^.]+$)/);
  if (!m) return null;
  const s = m[1];
  const yyyy = +s.slice(0, 4);
  const mm = +s.slice(4, 6);
  const dd = +s.slice(6, 8);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (
    d.getUTCFullYear() !== yyyy ||
    d.getUTCMonth() !== mm - 1 ||
    d.getUTCDate() !== dd
  ) {
    return null;
  }
  return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);
}

function titleFromName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/\s+\d{8}$/, '')
    .trim();
}

async function uploadOne(file, existing) {
  const ext = path.extname(file).replace(/^\./, '').toLowerCase();
  const key = randomKey(ext);

  if (!DRY) {
    const buf = await readFile(file);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, {
        contentType: ext === 'wav' ? 'audio/wav' : `audio/${ext}`,
        cacheControl: '31536000',
        upsert: false,
      });
    if (error) throw error;
  }
  existing.add(key);

  const title = titleFromName(path.basename(file));
  const date = parseDateFromName(file) ?? new Date().toISOString().slice(0, 10);

  if (!DRY) {
    const { error: insertErr } = await supabase.from('recordings').insert({
      date,
      title,
      audio_path: key,
      classmates: [],
    });
    if (insertErr) throw insertErr;
  }

  return { key, title, date };
}

async function main() {
  const files = (await readdir(DATA))
    .filter((f) => f.toLowerCase().endsWith('.wav'))
    .sort();
  console.log(`发现 ${files.length} 个音频文件${DRY ? '（dry-run）' : ''}`);

  let existing = new Set();
  if (!DRY) existing = await listObjects();

  let ok = 0;
  let fail = 0;
  for (const f of files) {
    if (ok >= LIMIT) break;
    const full = path.join(DATA, f);
    const size = (await stat(full)).size;
    try {
      const r = await uploadOne(full, existing);
      ok++;
      console.log(`✓ [${ok}] ${f} (${(size / 1024 / 1024).toFixed(1)}MB) → ${r.key}`);
    } catch (e) {
      fail++;
      console.error(`✗ ${f}: ${e.message ?? e}`);
    }
  }
  console.log(`完成：成功 ${ok}，失败 ${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
