import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Sprout, LayoutDashboard, TreePine, Package, Calendar, BarChart3, CreditCard, User, Users, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const backend = useBackend();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => backend.user.getProfile(),
  });

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  const userNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/kebun", label: "Kebun", icon: TreePine },
    { path: "/panen", label: "Panen", icon: Package },
    { path: "/pupuk", label: "Pemupukan", icon: Sprout },
    { path: "/laporan", label: "Laporan", icon: BarChart3 },
    { path: "/paket", label: "Paket", icon: CreditCard },
    { path: "/akun", label: "Akun", icon: User },
  ];

  const adminNavItems = [
    { path: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Kelola User", icon: Users },
    { path: "/admin/paket", label: "Kelola Paket", icon: Settings },
    { path: "/admin/payments", label: "Pembayaran", icon: CreditCard },
  ];

  const navItems = location.pathname.startsWith("/admin") ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-foreground">eSawit</h1>
              <p className="text-xs text-muted-foreground">Kelola Sawit Cerdas</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && !location.pathname.startsWith("/admin") && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border-t border-border mt-4 pt-4"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}

          {location.pathname.startsWith("/admin") && (
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border-t border-border mt-4 pt-4"
            >
              <User className="h-5 w-5" />
              <span className="font-medium">User Panel</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <UserButton afterSignOutUrl="/login" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.paketName} • {profile?.kebunCount}/{profile?.maxKebun} kebun
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
