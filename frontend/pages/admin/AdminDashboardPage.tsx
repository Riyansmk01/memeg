import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, TreePine } from "lucide-react";

export default function AdminDashboardPage() {
  const backend = useBackend();

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => backend.user.listUsers(),
  });

  const totalUsers = users?.users.length || 0;
  const adminUsers = users?.users.filter((u: { role: string }) => u.role === "admin").length || 0;
  const regularUsers = users?.users.filter((u: { role: string }) => u.role === "user").length || 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Kelola sistem eSawit</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total User</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">User Reguler</CardTitle>
              <TreePine className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{regularUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Petani/pengelola</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admin</CardTitle>
              <Users className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{adminUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Pengelola sistem</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paket Tersedia</CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground mt-1">Free, Basic, Pro</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {users?.users && users.users.length > 0 ? (
              <div className="space-y-4">
                {users.users.slice(0, 5).map((user: { id: string; name: string; email: string; role: string; paketName: string }) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{user.role}</p>
                      <p className="text-xs text-muted-foreground">{user.paketName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Belum ada user</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
