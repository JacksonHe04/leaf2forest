# Leaf iNon SSO cutover

## Identity model

Every verified iNon user may enter Leaf as an ordinary project member. A Leaf
Team member is a separate, project-local assignment to one classmate archive.
Project administrator status comes only from the central iNon project role.

The protected `public.leaf_team_memberships` table stores:

- the classmate archive ID;
- the normalized iNon account email assigned by a Leaf administrator;
- the immutable iNon user ID after that verified account first claims it;
- the assigning administrator and timestamps.

The table has RLS enabled with no anon policies. Only the server-side Supabase
service role accesses it. Changing the assigned email clears the previous iNon
user binding so the replacement must verify the new email through iNon SSO.

## Authorization

- Ordinary members may browse the public archive.
- Team members may edit only their assigned classmate archive.
- Leaf project administrators may manage classmates, Team member assignments,
  recordings, images, audio, and transcription.
- Leaf project administrators cannot appoint or remove project administrators;
  that remains the global iNon super administrator's central permission.

All mutation routes enforce these rules server-side. The legacy Supabase
username/password, password-change, and Supabase session flows are disabled.

## Data boundary

Classmate, teacher, recording, image, and audio data remain in Supabase. iNon
SSO owns identity, login methods, sessions, global username, and project roles.
No iNon OAuth client secret is stored in Supabase or committed to Git.

## Implemented

- Published client dependency pinned to `@inon-ai/inon-sso@0.1.0`.
- Applied Supabase migration `add_leaf_team_memberships` to project
  `lugszrtwvninbduskick`; the new table has RLS enabled and no anon policies.
- Added the Leaf OAuth callback and encrypted project-session route.
- Replaced login, logout, account lookup, admin-page protection, and password
  management with iNon SSO.
- Added the ordinary-member state for iNon users who are not Leaf Team members.
- Added Team member email assignment to the existing Leaf administrator table.
- Enforced project-admin or self-Team-member authorization on every mutation
  route; project-admin checks are revalidated against the central SSO.

TypeScript and affected-file lint completed successfully. The Next.js production
build compiled and typechecked, then the existing `/echoes` prerender failed
while Supabase returned `PGRST303 JWT issued at future`; this failure occurred
while reading existing archive data, outside the SSO code path.

## Existing Supabase exposure

Supabase reports that `public.classmates`, `public.recordings`, and
`public.teachers` have RLS disabled. Because the anon key is browser-visible,
those tables can currently be mutated directly outside the newly protected
Next.js routes. This cutover does not silently enable RLS because doing so
without an agreed policy would change public read behavior. The intended policy
is public read-only access with all writes reserved for the server service role.
