import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function AkunPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => backend.user.getProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string }) => backend.user.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profil berhasil diperbarui" });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal memperbarui profil", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Akun Saya</h1>
          <p className="text-muted-foreground mt-1">Kelola informasi akun Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
              <CardDescription>Perbarui nama dan informasi pribadi</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={name || profile?.name || ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={profile?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{profile?.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                </div>
                <Button type="submit">Perbarui Profil</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{profile?.role}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Paket Aktif</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">{profile?.paketName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Max {profile?.maxKebun} kebun • {profile?.fiturEkspor ? "Ekspor tersedia" : "Ekspor tidak tersedia"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Terdaftar Sejak</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
