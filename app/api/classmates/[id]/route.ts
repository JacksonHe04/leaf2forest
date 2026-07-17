import { NextResponse } from 'next/server';
import {
  deleteClassmate,
  getClassmateByIdOrUserId,
  updateClassmate,
} from '@/lib/db/classmates';

export const dynamic = 'force-dynamic';

/** The [id] segment carries a user_id; resolve to the internal uuid record. */
async function resolve(userId: string) {
  return await getClassmateByIdOrUserId(userId);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classmate = await resolve(id);
    if (!classmate) {
      return NextResponse.json({ error: '未找到同学' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success', data: classmate });
  } catch (error) {
    console.error('获取同学失败:', error);
    return NextResponse.json({ error: '获取同学失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classmate = await resolve(id);
    if (!classmate) {
      return NextResponse.json({ error: '未找到同学' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await updateClassmate(classmate.id, body);
    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    console.error('更新同学失败:', error);
    return NextResponse.json({ error: '更新同学失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classmate = await resolve(id);
    if (!classmate) {
      return NextResponse.json({ error: '未找到同学' }, { status: 404 });
    }
    await deleteClassmate(classmate.id);
    return NextResponse.json({ status: 'success', message: '同学已删除' });
  } catch (error) {
    console.error('删除同学失败:', error);
    return NextResponse.json({ error: '删除同学失败' }, { status: 500 });
  }
}
