import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Legacy route — recording detail has moved to /echoes/[id]
 * (CLAUDE.md §5 information architecture). Keep this 308 redirect
 * so any existing bookmarks / external links keep working.
 */
export default async function LegacyRecordingPage({ params }: Props) {
  const { id } = await params;
  redirect(`/echoes/${id}`);
}
