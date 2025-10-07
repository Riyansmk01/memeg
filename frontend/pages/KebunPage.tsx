import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, TreePine, Edit, Trash2 } from "lucide-react";

export default function KebunPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKebun, setSelectedKebun] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    luasHa: "",
    jumlahPohon: "",
    lokasi: "",
  });

  const { data } = useQuery({
    queryKey: ["kebun"],
    queryFn: async () => backend.kebun.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { nama: string; luasHa: number; jumlahPohon: number; lokasi?: string }) =>
      backend.kebun.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kebun"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Kebun berhasil ditambahkan" });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menambahkan kebun", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; nama: string; luasHa: number; jumlahPohon: number; lokasi?: string }) =>
      backend.kebun.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kebun"] });
      toast({ title: "Kebun berhasil diperbarui" });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal memperbarui kebun", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => backend.kebun.deleteKebun({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kebun"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Kebun berhasil dihapus" });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menghapus kebun", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ nama: "", luasHa: "", jumlahPohon: "", lokasi: "" });
    setEditMode(false);
    setSelectedKebun(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nama: formData.nama,
      luasHa: parseFloat(formData.luasHa),
      jumlahPohon: parseInt(formData.jumlahPohon),
      lokasi: formData.lokasi || undefined,
    };

    if (editMode && selectedKebun) {
      updateMutation.mutate({ id: selectedKebun, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (kebun: any) => {
    setEditMode(true);
    setSelectedKebun(kebun.id);
    setFormData({
      nama: kebun.nama,
      luasHa: kebun.luasHa.toString(),
      jumlahPohon: kebun.jumlahPohon.toString(),
      lokasi: kebun.lokasi || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus kebun ini? Semua data panen dan pupuk akan ikut terhapus.")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manajemen Kebun</h1>
            <p className="text-muted-foreground mt-1">Kelola data kebun sawit Anda</p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kebun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Kebun" : "Tambah Kebun Baru"}</DialogTitle>
                <DialogDescription>Masukkan detail kebun sawit</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Kebun *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="luasHa">Luas (Ha) *</Label>
                    <Input
                      id="luasHa"
                      type="number"
                      step="0.01"
                      value={formData.luasHa}
                      onChange={(e) => setFormData({ ...formData, luasHa: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlahPohon">Jumlah Pohon *</Label>
                    <Input
                      id="jumlahPohon"
                      type="number"
                      value={formData.jumlahPohon}
                      onChange={(e) => setFormData({ ...formData, jumlahPohon: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <Textarea
                    id="lokasi"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}>
                    Batal
                  </Button>
                  <Button type="submit">{editMode ? "Perbarui" : "Simpan"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.kebun && data.kebun.length > 0 ? (
            data.kebun.map((kebun) => (
              <Card key={kebun.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <TreePine className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{kebun.nama}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {kebun.luasHa.toFixed(2)} Ha • {kebun.jumlahPohon.toLocaleString("id-ID")} pohon
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(kebun)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(kebun.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kebun.lokasi && (
                    <div>
                      <p className="text-xs text-muted-foreground">Lokasi</p>
                      <p className="text-sm text-foreground">{kebun.lokasi}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Panen</p>
                      <p className="text-lg font-semibold text-foreground">{kebun.totalPanen}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pendapatan</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(kebun.totalPendapatan)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TreePine className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Belum ada kebun</p>
                <p className="text-muted-foreground mb-4">Mulai dengan menambahkan kebun sawit pertama Anda</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kebun
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
