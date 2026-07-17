import { listClassmatesByIds } from './classmates';
import { listTeachersByIds } from './teachers';
import type { Person } from './types';

/**
 * Resolve an array of UUIDs (which may contain both classmate and teacher IDs)
 * into an array of Person objects. Queries both tables and merges results.
 */
export async function resolvePeople(ids: string[]): Promise<Person[]> {
  if (ids.length === 0) return [];

  const [classmates, teachers] = await Promise.all([
    listClassmatesByIds(ids),
    listTeachersByIds(ids),
  ]);

  const people: Person[] = [
    ...classmates.map((c) => ({
      kind: 'classmate' as const,
      id: c.id,
      name: c.name,
      user_id: c.user_id,
    })),
    ...teachers.map((t) => ({
      kind: 'teacher' as const,
      id: t.id,
      name: t.name,
      subject: t.subject,
    })),
  ];

  // Preserve the order from the input IDs
  const map = new Map(people.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Person[];
}

/**
 * Collect all unique UUIDs from multiple recordings' `people` arrays,
 * resolve them, and return a Record<id, Person> map for fast lookup.
 */
export async function buildPeopleMap(
  groups: string[][]
): Promise<Record<string, Person>> {
  const allIds = new Set<string>();
  for (const ids of groups) ids.forEach((id) => allIds.add(id));
  const list = await resolvePeople([...allIds]);
  return Object.fromEntries(list.map((p) => [p.id, p]));
}
