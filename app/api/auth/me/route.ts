import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/supabase-server';
import { getClassmateByUserId } from '@/lib/db/classmates';

/**
 * GET /api/auth/me — returns the current authenticated user's info.
 * Used by client components to determine auth state without making
 * the layout dynamic.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const classmate = user.user_metadata?.user_id
    ? await getClassmateByUserId(user.user_metadata.user_id)
    : null;

  return NextResponse.json({
    user: {
      id: user.id,
      is_admin: user.user_metadata?.is_admin === true,
      classmate_id: classmate?.id ?? null,
      user_id: classmate?.user_id ?? user.user_metadata?.user_id ?? null,
      name: classmate?.name ?? null,
    },
  });
}
