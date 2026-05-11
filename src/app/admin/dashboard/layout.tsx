import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
