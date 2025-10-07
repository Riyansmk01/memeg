import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => backend.user.listUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "user" | "admin" }) =>
      backend.user.updateUserRole({ userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role user berhasil diperbarui" });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal memperbarui role", description: error.message, variant: "destructive" });
    },
  });

  const handleRoleChange = (userId: string, role: string) => {
    if (confirm("Yakin ingin mengubah role user ini?")) {
      updateRoleMutation.mutate({ userId, role: role as "user" | "admin" });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola User</h1>
          <p className="text-muted-foreground mt-1">Lihat dan kelola semua pengguna</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {data?.users && data.users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Terdaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user: { id: string; name: string; email: string; role: string; paketName: string; createdAt: Date }) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.paketName}</TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Belum ada user</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
