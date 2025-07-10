import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';

/**
 * 获取数据库中所有集合的列表
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    
    // 获取所有集合名称
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // 获取每个集合的文档数量
    const collectionsInfo = await Promise.all(
      collectionNames.map(async (name) => {
        const collection = db.collection(name);
        const count = await collection.countDocuments();
        return {
          name,
          count
        };
      })
    );
    
    return NextResponse.json({
      status: 'success',
      data: collectionsInfo
    });
  } catch (error) {
    console.error('获取集合列表失败:', error);
    return NextResponse.json(
      { error: '获取集合列表失败' },
      { status: 500 }
    );
  }
}