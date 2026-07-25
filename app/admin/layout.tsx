import { requireLeafAdminPage } from "@/lib/auth/viewer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLeafAdminPage("/admin");
  return children;
}
