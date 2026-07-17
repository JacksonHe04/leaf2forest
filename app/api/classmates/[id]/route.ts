import { NextResponse } from 'next/server';
import { deleteClassmate, getClassmate, updateClassmate } from '@/lib/db/classmates';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classmate = await getClassmate(id);
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
    const body = await request.json();
    const updated = await updateClassmate(id, body);
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
    await deleteClassmate(id);
    return NextResponse.json({ status: 'success', message: '同学已删除' });
  } catch (error) {
    console.error('删除同学失败:', error);
    return NextResponse.json({ error: '删除同学失败' }, { status: 500 });
  }
}
