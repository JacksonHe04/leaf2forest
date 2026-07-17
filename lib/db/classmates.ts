import { getSupabaseAdmin } from './supabase';
import type { Classmate, ClassmatePatch } from './types';
import { slugFromName } from '../slug';
import { pinyin } from 'pinyin-pro';

function table() {
  return getSupabaseAdmin().from('classmates');
}

/**
 * Compare two Chinese names by their pinyin spelling so that the list
 * follows alphabetical (A→Z) order rather than Unicode radical order.
 */
function compareByPinyin(a: string, b: string): number {
  const pa = pinyin(a, { toneType: 'none', type: 'array' }).join(' ').toLowerCase();
  const pb = pinyin(b, { toneType: 'none', type: 'array' }).join(' ').toLowerCase();
  if (pa < pb) return -1;
  if (pa > pb) return 1;
  return 0;
}

export async function listClassmates(): Promise<Classmate[]> {
  const { data, error } = await table().select('*');
  if (error) throw error;
  return ((data ?? []) as Classmate[]).sort((a, b) =>
    compareByPinyin(a.name, b.name)
  );
}

export async function getClassmateByUserId(
  userId: string
): Promise<Classmate | null> {
  const { data, error } = await table()
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Classmate | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a classmate by user_id first, then by uuid id (only when the
 * segment is actually a uuid — otherwise PostgREST rejects the bad format).
 */
export async function getClassmateByIdOrUserId(
  id: string
): Promise<Classmate | null> {
  const byUid = await getClassmateByUserId(id);
  if (byUid) return byUid;
  if (UUID_RE.test(id)) return await getClassmate(id);
  return null;
}

export async function listClassmatesByIds(ids: string[]): Promise<Classmate[]> {
  if (ids.length === 0) return [];
  const { data, error } = await table().select('*').in('id', ids);
  if (error) throw error;
  return (data ?? []) as Classmate[];
}

export async function getClassmate(id: string): Promise<Classmate | null> {
  const { data, error } = await table().select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Classmate | null;
}

export async function createClassmate(patch: ClassmatePatch): Promise<Classmate> {
  const finalPatch: ClassmatePatch = { ...patch };
  if (!finalPatch.user_id && finalPatch.name) {
    finalPatch.user_id = await uniqueUserId(slugFromName(finalPatch.name));
  }
  const { data, error } = await table()
    .insert(finalPatch)
    .select('*')
    .single();
  if (error) throw error;
  return data as Classmate;
}

/**
 * Generate a user_id from a base slug, appending -2, -3 … on collision.
 * Excludes `excludeId` so editing an existing classmate keeps its slug.
 */
export async function uniqueUserId(
  base: string,
  excludeId?: string
): Promise<string> {
  const { data, error } = await table().select('id, user_id');
  if (error) throw error;
  const taken = new Set(
    (data ?? [])
      .filter((r) => r.id !== excludeId && r.user_id)
      .map((r) => r.user_id as string)
  );
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) candidate = `${base}${n++}`;
  return candidate;
}

export async function updateClassmate(
  id: string,
  patch: ClassmatePatch
): Promise<Classmate> {
  const { data, error } = await table()
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Classmate;
}

export async function deleteClassmate(id: string): Promise<void> {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}
