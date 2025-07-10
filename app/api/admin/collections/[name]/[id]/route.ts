import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

/**
 * 获取指定文档
 */
export async function GET(
  request: Request,
  { params }: { params: { name: string; id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    const collection = db.collection(params.name);
    
    const document = await collection.findOne({ _id: new ObjectId(params.id) });
    
    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'success',
      data: document
    });
  } catch (error) {
    console.error('获取文档失败:', error);
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新指定文档
 */
export async function PUT(
  request: Request,
  { params }: { params: { name: string; id: string } }
) {
  try {
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    const collection = db.collection(params.name);
    
    // 移除_id字段，避免更新冲突
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = body;
    
    // 添加更新时间
    updateData.updatedAt = new Date();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'success',
      message: '文档更新成功'
    });
  } catch (error) {
    console.error('更新文档失败:', error);
    return NextResponse.json(
      { error: '更新文档失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除指定文档
 */
export async function DELETE(
  request: Request,
  { params }: { params: { name: string; id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    const collection = db.collection(params.name);
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'success',
      message: '文档删除成功'
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json(
      { error: '删除文档失败' },
      { status: 500 }
    );
  }
}