import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { getClassmateByUserId } from '@/lib/db/classmates';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    // Look up classmate by user_id (pinyin slug)
    const classmate = await getClassmateByUserId(username.toLowerCase().trim());
    if (!classmate) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // Construct the internal email for Supabase Auth
    const email = `${classmate.user_id}@auth.leaf2forest.local`;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        classmate_id: classmate.id,
        user_id: classmate.user_id,
        name: classmate.name,
        is_admin: classmate.is_admin,
      },
    });
  } catch {
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
