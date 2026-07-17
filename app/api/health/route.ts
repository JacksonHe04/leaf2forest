import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase';
import { BUCKET_IMAGES, BUCKET_RECORDINGS } from '@/lib/storage';

/**
 * Health check + a quick tally of classrooms / recordings / buckets.
 * Replaces the old `/api/test` that pinged MongoDB.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const [{ count: classmates }, { count: recordings }] = await Promise.all([
      supabase.from('classmates').select('*', { count: 'exact', head: true }),
      supabase.from('recordings').select('*', { count: 'exact', head: true }),
    ]);

    const [recordingsBucket, imagesBucket] = await Promise.all([
      supabase.storage.getBucket(BUCKET_RECORDINGS),
      supabase.storage.getBucket(BUCKET_IMAGES),
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Supabase 已连通',
      data: {
        counts: { classmates: classmates ?? 0, recordings: recordings ?? 0 },
        buckets: {
          recordings: recordingsBucket.error ? null : recordingsBucket.data?.name,
          images: imagesBucket.error ? null : imagesBucket.data?.name,
        },
      },
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json(
      { status: 'error', message: 'Supabase 不可达' },
      { status: 500 }
    );
  }
}
