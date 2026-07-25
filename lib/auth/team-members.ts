import type { InonProjectSession } from "@inon-ai/inon-sso";

import { getClassmate } from "@/lib/db/classmates";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import type { Classmate } from "@/lib/db/types";

export type TeamMembership = {
  classmate_id: string;
  account_email: string;
  inon_user_id: string | null;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  linked_at: string | null;
};

export type AdminClassmate = Classmate & {
  team_account_email: string | null;
  team_inon_user_id: string | null;
};

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function resolveTeamMember(
  session: InonProjectSession,
): Promise<Classmate | null> {
  if (!session.emailVerified) return null;
  const database = getSupabaseAdmin();
  const table = database.from("leaf_team_memberships");

  const { data: linked, error: linkedError } = await table
    .select("*")
    .eq("inon_user_id", session.id)
    .maybeSingle<TeamMembership>();
  if (linkedError) throw linkedError;
  if (linked) return getClassmate(linked.classmate_id);

  const email = normalizedEmail(session.email);
  const { data: assigned, error: assignedError } = await table
    .select("*")
    .eq("account_email", email)
    .maybeSingle<TeamMembership>();
  if (assignedError) throw assignedError;
  if (!assigned) return null;
  if (assigned.inon_user_id && assigned.inon_user_id !== session.id) {
    return null;
  }

  if (!assigned.inon_user_id) {
    const now = new Date().toISOString();
    const { error } = await table
      .update({
        inon_user_id: session.id,
        linked_at: now,
        updated_at: now,
      })
      .eq("classmate_id", assigned.classmate_id)
      .is("inon_user_id", null);
    if (error) throw error;
  }

  return getClassmate(assigned.classmate_id);
}

export async function listAdminClassmates(
  classmates: Classmate[],
): Promise<AdminClassmate[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("leaf_team_memberships")
    .select("classmate_id, account_email, inon_user_id");
  if (error) throw error;
  const memberships = new Map(
    (data ?? []).map((row) => [row.classmate_id, row]),
  );
  return classmates.map((classmate) => {
    const membership = memberships.get(classmate.id);
    return {
      ...classmate,
      team_account_email: membership?.account_email ?? null,
      team_inon_user_id: membership?.inon_user_id ?? null,
    };
  });
}

export async function setTeamMemberAssignment(input: {
  classmateId: string;
  email: string | null;
  assignedBy: string;
}): Promise<void> {
  const table = getSupabaseAdmin().from("leaf_team_memberships");
  if (!input.email) {
    const { error } = await table
      .delete()
      .eq("classmate_id", input.classmateId);
    if (error) throw error;
    return;
  }

  const email = normalizedEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("请输入有效的 iNon 账号邮箱");
  }
  const { data: existing, error: findError } = await table
    .select("account_email, inon_user_id, linked_at")
    .eq("classmate_id", input.classmateId)
    .maybeSingle<Pick<
      TeamMembership,
      "account_email" | "inon_user_id" | "linked_at"
    >>();
  if (findError) throw findError;
  const sameEmail = existing?.account_email === email;
  const now = new Date().toISOString();
  const { error } = await table.upsert(
    {
      classmate_id: input.classmateId,
      account_email: email,
      inon_user_id: sameEmail ? existing?.inon_user_id ?? null : null,
      linked_at: sameEmail ? existing?.linked_at ?? null : null,
      assigned_by: input.assignedBy,
      updated_at: now,
    },
    { onConflict: "classmate_id" },
  );
  if (error) throw error;
}
