import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('leaf-to-forest');
    
    // 测试数据库连接
    await db.command({ ping: 1 });
    
    return NextResponse.json({ 
      status: 'success', 
      message: '数据库连接成功' 
    });
  } catch (error) {
    console.error('数据库连接错误:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '数据库连接失败' 
      },
      { status: 500 }
    );
  }
} 