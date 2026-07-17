import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';

export async function POST(request: Request) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要 6 个字符' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return NextResponse.json(
        { error: '密码修改失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '密码修改失败，请稍后重试' },
      { status: 500 }
    );
  }
}
