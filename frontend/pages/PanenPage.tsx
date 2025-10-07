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
import { Plus, Package, Trash2 } from "lucide-react";

export default function PanenPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    kebunId: "",
    tanggal: new Date().toISOString().split("T")[0],
    beratKg: "",
    hargaPerKg: "",
  });

  const { data: kebunList } = useQuery({
    queryKey: ["kebun"],
    queryFn: async () => backend.kebun.list(),
  });

  const { data } = useQuery({
    queryKey: ["panen"],
    queryFn: async () => backend.panen.list({}),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { kebunId: number; tanggal: Date; beratKg: number; hargaPerKg: number }) =>
      backend.panen.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panen"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["kebun"] });
      toast({ title: "Data panen berhasil ditambahkan" });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menambahkan data panen", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => backend.panen.deletePanen({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panen"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["kebun"] });
      toast({ title: "Data panen berhasil dihapus" });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal menghapus data panen", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      kebunId: "",
      tanggal: new Date().toISOString().split("T")[0],
      beratKg: "",
      hargaPerKg: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      kebunId: parseInt(formData.kebunId),
      tanggal: new Date(formData.tanggal),
      beratKg: parseFloat(formData.beratKg),
      hargaPerKg: parseFloat(formData.hargaPerKg),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus data panen ini?")) {
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
            <h1 className="text-3xl font-bold text-foreground">Catatan Panen</h1>
            <p className="text-muted-foreground mt-1">Catat hasil panen TBS (Tandan Buah Segar)</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Panen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Data Panen</DialogTitle>
                <DialogDescription>Catat hasil panen TBS hari ini</DialogDescription>
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
                  <Label htmlFor="tanggal">Tanggal Panen *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beratKg">Berat (Kg) *</Label>
                    <Input
                      id="beratKg"
                      type="number"
                      step="0.01"
                      value={formData.beratKg}
                      onChange={(e) => setFormData({ ...formData, beratKg: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hargaPerKg">Harga/Kg (Rp) *</Label>
                    <Input
                      id="hargaPerKg"
                      type="number"
                      step="0.01"
                      value={formData.hargaPerKg}
                      onChange={(e) => setFormData({ ...formData, hargaPerKg: e.target.value })}
                      required
                    />
                  </div>
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
            {data?.panen && data.panen.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kebun</TableHead>
                    <TableHead className="text-right">Berat (Kg)</TableHead>
                    <TableHead className="text-right">Harga/Kg</TableHead>
                    <TableHead className="text-right">Total Pendapatan</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.panen.map((panen) => (
                    <TableRow key={panen.id}>
                      <TableCell>
                        {new Date(panen.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{panen.kebunNama}</TableCell>
                      <TableCell className="text-right">{panen.beratKg.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(panen.hargaPerKg)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(panen.totalPendapatan)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(panen.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Belum ada data panen</p>
                <p className="text-muted-foreground mb-4">Mulai catat hasil panen TBS Anda</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Panen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
