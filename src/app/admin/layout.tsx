// Root admin layout — middleware handles auth redirects.
// Dashboard sub-routes have their own layout with sidebar.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
