import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';

/**
 * 获取指定集合的所有文档
 */
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    const collection = db.collection(params.name);
    
    // 获取文档总数
    const total = await collection.countDocuments();
    
    // 获取分页数据
    const documents = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .toArray();
    
    return NextResponse.json({
      status: 'success',
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取集合数据失败:', error);
    return NextResponse.json(
      { error: '获取集合数据失败' },
      { status: 500 }
    );
  }
}

/**
 * 向指定集合添加新文档
 */
export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    const collection = db.collection(params.name);
    
    // 添加创建时间和更新时间
    const document = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(document);
    
    return NextResponse.json({
      status: 'success',
      data: {
        insertedId: result.insertedId,
        document
      }
    });
  } catch (error) {
    console.error('添加文档失败:', error);
    return NextResponse.json(
      { error: '添加文档失败' },
      { status: 500 }
    );
  }
}