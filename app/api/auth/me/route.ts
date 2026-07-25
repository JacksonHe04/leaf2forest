import { getLeafViewer } from "@/lib/auth/viewer";

export async function GET() {
  const viewer = await getLeafViewer();
  if (!viewer) return Response.json({ user: null });

  return Response.json({
    user: {
      id: viewer.session.id,
      email: viewer.session.email,
      username: viewer.session.username,
      is_admin: viewer.isAdmin,
      classmate_id: viewer.classmate?.id ?? null,
      user_id: viewer.classmate?.user_id ?? null,
      name: viewer.classmate?.name ?? viewer.session.username,
      is_team_member: Boolean(viewer.classmate),
    },
  });
}
