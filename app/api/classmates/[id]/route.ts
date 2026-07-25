import { NextResponse } from 'next/server';
import {
  deleteClassmate,
  getClassmateByIdOrUserId,
  updateClassmate,
} from '@/lib/db/classmates';
import {
  forbidden,
  isLeafAdminRequest,
  viewerFromRequest,
} from '@/lib/auth/viewer';
import { setTeamMemberAssignment } from '@/lib/auth/team-members';

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
    const body = (await request.json()) as Record<string, unknown>;
    const viewer = await viewerFromRequest(request);
    if (!viewer) return forbidden();
    const isSelf = viewer.classmate?.id === classmate.id;
    const isAdmin = await isLeafAdminRequest(request);
    if (!isSelf && !isAdmin) return forbidden();

    if ("team_account_email" in body) {
      if (!isAdmin) return forbidden();
      const email =
        typeof body.team_account_email === "string"
          ? body.team_account_email.trim() || null
          : null;
      await setTeamMemberAssignment({
        classmateId: classmate.id,
        email,
        assignedBy: viewer.session.id,
      });
      delete body.team_account_email;
    }

    delete body.team_inon_user_id;
    delete body.is_admin;
    if (!isAdmin) {
      delete body.name;
      delete body.user_id;
    }
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ status: 'success', data: classmate });
    }
    const updated = await updateClassmate(classmate.id, body);
    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    console.error('更新同学失败:', error);
    return NextResponse.json({ error: '更新同学失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isLeafAdminRequest(request))) return forbidden();
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
