import { getSupabaseAdmin } from './supabase';
import type { Teacher, TeacherPatch } from './types';

function table() {
  return getSupabaseAdmin().from('teachers');
}

export async function listTeachers(): Promise<Teacher[]> {
  const { data, error } = await table().select('*');
  if (error) throw error;
  return (data ?? []) as Teacher[];
}

export async function listTeachersByIds(ids: string[]): Promise<Teacher[]> {
  if (ids.length === 0) return [];
  const { data, error } = await table().select('*').in('id', ids);
  if (error) throw error;
  return (data ?? []) as Teacher[];
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const { data, error } = await table().select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Teacher | null;
}

export async function createTeacher(patch: TeacherPatch): Promise<Teacher> {
  const { data, error } = await table()
    .insert(patch)
    .select('*')
    .single();
  if (error) throw error;
  return data as Teacher;
}

export async function updateTeacher(
  id: string,
  patch: TeacherPatch
): Promise<Teacher> {
  const { data, error } = await table()
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Teacher;
}

export async function deleteTeacher(id: string): Promise<void> {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}
