import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      bucket?: string;
      names?: string | string[];
    };
    const bucket = body.bucket ?? 'recordings';
    const names = Array.isArray(body.names)
      ? body.names
      : body.names
      ? [body.names]
      : [];

    if (names.length === 0) {
      return NextResponse.json(
        { success: false, error: 'names 不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(bucket).remove(names);
    if (error) throw error;
    return NextResponse.json({ success: true, removed: names });
  } catch (error) {
    console.error('删除对象失败:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
