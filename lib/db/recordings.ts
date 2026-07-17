import { getSupabaseAdmin } from './supabase';
import type { Recording, RecordingPatch } from './types';

function table() {
  return getSupabaseAdmin().from('recordings');
}

export interface ListRecordingsOptions {
  classmateId?: string;
  from?: string; // YYYY-MM-DD inclusive
  to?: string; // YYYY-MM-DD inclusive
  limit?: number;
}

export async function listRecordings(
  opts: ListRecordingsOptions = {}
): Promise<Recording[]> {
  let q = table().select('*').order('num', { ascending: true });

  if (opts.classmateId) {
    // uuid[] contains
    q = q.contains('classmates', [opts.classmateId]);
  }
  if (opts.from) q = q.gte('date', opts.from);
  if (opts.to) q = q.lte('date', opts.to);
  if (opts.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Recording[];
}

export async function getRecording(id: string): Promise<Recording | null> {
  const { data, error } = await table().select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Recording | null;
}

export async function getRecordingByNum(num: number): Promise<Recording | null> {
  const { data, error } = await table()
    .select('*')
    .eq('num', num)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Recording | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a recording by num first, then by uuid id (only when the segment
 * is actually a uuid — otherwise PostgREST rejects the bad format).
 */
export async function getRecordingByIdOrNum(
  raw: string
): Promise<Recording | null> {
  const n = Number(raw);
  if (Number.isInteger(n) && n > 0) {
    const byNum = await getRecordingByNum(n);
    if (byNum) return byNum;
  }
  if (UUID_RE.test(raw)) return await getRecording(raw);
  return null;
}

export async function createRecording(patch: RecordingPatch): Promise<Recording> {
  const { data, error } = await table()
    .insert(patch)
    .select('*')
    .single();
  if (error) throw error;
  return data as Recording;
}

export async function updateRecording(
  id: string,
  patch: RecordingPatch
): Promise<Recording> {
  const { data, error } = await table()
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Recording;
}

export async function deleteRecording(id: string): Promise<void> {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}
