import { NextResponse } from 'next/server';
import { createRecording } from '@/lib/db/utils';

export async function GET() {
  try {
    // 测试数据
    const testRecordings = [
      {
        date: new Date("2019-09-01"),
        title: "开学第一天",
        audioUrl: "https://example.com/audio/first-day.mp3",
        transcription: "今天是高中开学的第一天，教室里充满了新同学的笑声...",
        background: "这是我高中生活的第一天，一切都是那么新鲜。",
        participants: ["我", "小明", "小红"],
        tags: ["开学", "第一天", "新生活"],
        location: "教室",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: new Date("2019-12-25"),
        title: "圣诞节晚会",
        audioUrl: "https://example.com/audio/christmas-party.mp3",
        transcription: "今天是圣诞节，我们班举办了一场热闹的晚会...",
        background: "这是我们班第一次举办圣诞节晚会，大家都很兴奋。",
        participants: ["我", "全班同学"],
        tags: ["圣诞节", "晚会", "班级活动"],
        location: "学校礼堂",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // 添加测试数据
    const results = await Promise.all(
      testRecordings.map(recording => createRecording(recording))
    );

    return NextResponse.json({ 
      status: 'success',
      message: '测试数据添加成功',
      data: results 
    });
  } catch (error) {
    console.error('添加测试数据失败:', error);
    return NextResponse.json(
      { error: '添加测试数据失败' },
      { status: 500 }
    );
  }
} 