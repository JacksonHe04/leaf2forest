import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * List all objects in a Supabase Storage bucket, with pagination.
 * Replaces the legacy `/api/files` (Vercel Blob).
 *
 * Query params:
 *   ?bucket=recordings|images   (default: recordings)
 *   &limit=100
 *   &offset=0
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bucket = url.searchParams.get('bucket') ?? 'recordings';
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') ?? '100'),
      1000
    );
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(undefined, { limit, offset, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw error;

    const items = (data ?? []).map((o) => {
      const pub = supabase.storage.from(bucket).getPublicUrl(o.name);
      return {
        name: o.name,
        size: o.metadata?.size ?? 0,
        contentType: o.metadata?.mimetype ?? null,
        uploadedAt: o.created_at,
        url: pub.data.publicUrl,
      };
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('列出对象失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}
