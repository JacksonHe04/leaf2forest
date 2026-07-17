import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(`${url.protocol}//${url.host}/`);
}
