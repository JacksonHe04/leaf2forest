import { getSupabaseAdmin } from './supabase';
import type { Classmate, ClassmatePatch } from './types';

function table() {
  return getSupabaseAdmin().from('classmates');
}

export async function listClassmates(): Promise<Classmate[]> {
  const { data, error } = await table().select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Classmate[];
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
  const { data, error } = await table()
    .insert(patch)
    .select('*')
    .single();
  if (error) throw error;
  return data as Classmate;
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
