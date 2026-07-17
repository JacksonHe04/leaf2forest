import { NextResponse } from 'next/server';
import {
  deleteRecording,
  getRecordingByIdOrNum,
  updateRecording,
} from '@/lib/db/recordings';

export const dynamic = 'force-dynamic';

/** The [id] segment carries a num; resolve to the internal uuid record. */
async function resolve(raw: string) {
  return await getRecordingByIdOrNum(raw);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recording = await resolve(id);
    if (!recording) {
      return NextResponse.json({ error: '未找到录音' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success', data: recording });
  } catch (error) {
    console.error('获取录音失败:', error);
    return NextResponse.json({ error: '获取录音失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recording = await resolve(id);
    if (!recording) {
      return NextResponse.json({ error: '未找到录音' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await updateRecording(recording.id, body);
    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    console.error('更新录音失败:', error);
    return NextResponse.json({ error: '更新录音失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recording = await resolve(id);
    if (!recording) {
      return NextResponse.json({ error: '未找到录音' }, { status: 404 });
    }
    await deleteRecording(recording.id);
    return NextResponse.json({ status: 'success', message: '录音已删除' });
  } catch (error) {
    console.error('删除录音失败:', error);
    return NextResponse.json({ error: '删除录音失败' }, { status: 500 });
  }
}
