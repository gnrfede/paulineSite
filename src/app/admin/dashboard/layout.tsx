import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex h-screen bg-cream-100">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
