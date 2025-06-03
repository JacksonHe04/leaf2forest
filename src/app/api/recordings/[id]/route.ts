import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/utils';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const collection = await getCollection('recordings');
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: body }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '未找到指定的录音' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success', message: '录音更新成功' });
  } catch (error) {
    console.error('更新录音失败:', error);
    return NextResponse.json({ error: '更新录音失败' }, { status: 500 });
  }
} 