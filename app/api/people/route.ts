import { NextResponse } from 'next/server';
import { listClassmates } from '@/lib/db/classmates';
import { listTeachers } from '@/lib/db/teachers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/people — returns all classmates and teachers for client-side
 * search/select components (e.g. ClassmateTagSelector).
 *
 * Response shape is intentionally lightweight: only the fields the
 * selector needs, not the full Classmate/Teacher rows.
 */
export async function GET() {
  try {
    const [classmates, teachers] = await Promise.all([
      listClassmates(),
      listTeachers(),
    ]);

    return NextResponse.json({
      status: 'success',
      data: {
        classmates: classmates.map((c) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          user_id: c.user_id,
        })),
        teachers: teachers.map((t) => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to list people:', error);
    return NextResponse.json(
      { error: '获取人员列表失败' },
      { status: 500 }
    );
  }
}
