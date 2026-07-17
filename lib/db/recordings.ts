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
  let q = table().select('*').order('date', { ascending: false }).order('time', {
    ascending: false,
  });

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
