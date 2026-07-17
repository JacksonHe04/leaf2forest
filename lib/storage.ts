/**
 * Storage helpers (Supabase Storage). Designed as a drop-in replacement for
 * the legacy `lib/blob.ts` so we don't repeat the same shim in every API route.
 */
import { getSupabaseAdmin } from './db/supabase';

export const BUCKET_RECORDINGS = 'recordings';
export const BUCKET_IMAGES = 'images';

export type Bucket = typeof BUCKET_RECORDINGS | typeof BUCKET_IMAGES;

export interface UploadResult {
  path: string; // object key inside the bucket
  publicUrl: string;
  size: number;
  contentType: string | null;
}

export async function uploadObject(
  bucket: Bucket,
  file: File | Blob | ArrayBuffer | Uint8Array | string,
  options?: {
    filename?: string;
    contentType?: string;
    cacheControl?: string;
  }
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  const filename = options?.filename ?? randomFilename();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      contentType: options?.contentType,
      cacheControl: options?.cacheControl ?? '3600',
      upsert: false,
    });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return {
    path: data.path,
    publicUrl: pub.publicUrl,
    size:
      typeof (file as File)?.size === 'number'
        ? (file as File).size
        : 0,
    contentType: options?.contentType ?? null,
  };
}

export async function deleteObject(
  bucket: Bucket,
  path: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: Bucket, path: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function randomFilename(ext?: string): string {
  // 16 random bytes -> 32 hex chars; very low collision probability
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const e = ext ? `.${ext.replace(/^\./, '')}` : '';
  return `${hex}${e}`;
}

// -------------------- pure validators (mirroring lib/blob.ts) --------------------

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const max = maxSizeInMB * 1024 * 1024;
  return file.size <= max;
}

export const AUDIO_MIME_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/flac',
  'audio/aac',
  'audio/x-m4a',
];

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];
