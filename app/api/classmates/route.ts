import { NextRequest, NextResponse } from 'next/server';
import {
  createClassmate,
  deleteClassmate,
  listClassmates,
  updateClassmate,
} from '@/lib/db/classmates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await listClassmates();
    return NextResponse.json({ status: 'success', data });
  } catch (error) {
    console.error('获取同学列表失败:', error);
    return NextResponse.json({ error: '获取同学列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createClassmate(body);
    return NextResponse.json({ status: 'success', data: created });
  } catch (error) {
    console.error('创建同学失败:', error);
    return NextResponse.json({ error: '创建同学失败' }, { status: 500 });
  }
}
