/**
 * Typed row shapes mirror the Postgres schema. Keep in sync with
 * `supabase/migrations/init_classmates_recordings`.
 */
export interface Classmate {
  id: string;
  /** URL-safe pinyin of the name, e.g. "chenhao". Unique, used in /forest/[userId]. */
  user_id: string;
  /** Whether this classmate has admin privileges. */
  is_admin: boolean;
  name: string;
  avatar_path: string | null;
  gender: string | null;
  birth_date: string | null; // ISO date (YYYY-MM-DD)
  city: string | null;
  qq: string | null;
  wechat: string | null;
  phone: string | null;
  employer: string | null;
  industry: string | null;
  bachelor_university: string | null;
  bachelor_major: string | null;
  master_university: string | null;
  master_major: string | null;
  doctor_university: string | null;
  doctor_major: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type ClassmatePatch = Partial<Omit<Classmate, 'id' | 'created_at' | 'updated_at'>>;

export interface Recording {
  id: string;
  /** Auto-increment integer used in /echoes/[num]. Distinct from the uuid `id`. */
  num: number;
  date: string; // ISO date (YYYY-MM-DD)
  time: string | null; // HH:MM:SS
  title: string;
  description: string | null;
  transcription: string | null;
  background: string | null;
  location: string | null;
  audio_path: string;
  duration_seconds: number | null;
  classmates: string[]; // uuid[]
  created_at: string;
  updated_at: string;
}

export type RecordingPatch = Partial<
  Omit<Recording, 'id' | 'num' | 'created_at' | 'updated_at'>
>;
