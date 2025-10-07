import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Sprout, Trash2 } from "lucide-react";

export default function PupukPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    kebunId: "",
    tanggal: new Date().toISOString().split("T")[0],
    jenisPupuk: "",
    biaya: "",
  });

  const { data: kebunList } = useQuery({
    queryKey: ["kebun"],
    queryFn: async () => backend.kebun.list(),
  });

  const { data } = useQuery({
    queryKey: ["pupuk"],
    queryFn: async () => backend.pupuk.list({}),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { kebunId: number; tanggal: Date; jenisPupuk: string; biaya: number }) =>
      backend.pupuk.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pupuk"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Data pemupukan berhasil ditambahkan" });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menambahkan data pemupukan", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => backend.pupuk.deletePupuk({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pupuk"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Data pemupukan berhasil dihapus" });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menghapus data pemupukan", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      kebunId: "",
      tanggal: new Date().toISOString().split("T")[0],
      jenisPupuk: "",
      biaya: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      kebunId: parseInt(formData.kebunId),
      tanggal: new Date(formData.tanggal),
      jenisPupuk: formData.jenisPupuk,
      biaya: parseFloat(formData.biaya),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus data pemupukan ini?")) {
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
            <h1 className="text-3xl font-bold text-foreground">Catatan Pemupukan</h1>
            <p className="text-muted-foreground mt-1">Catat jadwal dan biaya pemupukan</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pemupukan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Data Pemupukan</DialogTitle>
                <DialogDescription>Catat aplikasi pupuk pada kebun</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kebunId">Kebun *</Label>
                  <Select
                    value={formData.kebunId}
                    onValueChange={(value) => setFormData({ ...formData, kebunId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kebun" />
                    </SelectTrigger>
                    <SelectContent>
                      {kebunList?.kebun.map((kebun) => (
                        <SelectItem key={kebun.id} value={kebun.id.toString()}>
                          {kebun.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal Aplikasi *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenisPupuk">Jenis Pupuk *</Label>
                  <Input
                    id="jenisPupuk"
                    placeholder="NPK, Urea, KCl, dll"
                    value={formData.jenisPupuk}
                    onChange={(e) => setFormData({ ...formData, jenisPupuk: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biaya">Biaya (Rp) *</Label>
                  <Input
                    id="biaya"
                    type="number"
                    step="0.01"
                    value={formData.biaya}
                    onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {data?.pupuk && data.pupuk.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kebun</TableHead>
                    <TableHead>Jenis Pupuk</TableHead>
                    <TableHead className="text-right">Biaya</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pupuk.map((pupuk) => (
                    <TableRow key={pupuk.id}>
                      <TableCell>
                        {new Date(pupuk.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{pupuk.kebunNama}</TableCell>
                      <TableCell>{pupuk.jenisPupuk}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(pupuk.biaya)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pupuk.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Sprout className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Belum ada data pemupukan</p>
                <p className="text-muted-foreground mb-4">Mulai catat aplikasi pupuk pada kebun Anda</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pemupukan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
