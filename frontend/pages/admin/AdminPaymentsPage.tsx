import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Payment {
  id: number;
  userId: string;
  userName: string;
  paketNama: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  createdAt: Date;
  verifiedAt?: Date;
}

export default function AdminPaymentsPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await backend.payment.list();
      setPayments(data.payments);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal memuat data pembayaran",
      });
    } finally {
      setLoading(false);
    }
  };

  const openVerifyDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setAdminNotes("");
    setVerifyDialog(true);
  };

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!selectedPayment) return;

    try {
      setVerifying(true);
      await backend.payment.verify({
        paymentId: selectedPayment.id,
        status,
        adminNotes: adminNotes || undefined,
      });

      toast({
        title: "Berhasil!",
        description: status === "verified" ? "Pembayaran berhasil diverifikasi" : "Pembayaran ditolak",
      });

      setVerifyDialog(false);
      loadPayments();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal memverifikasi pembayaran",
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500">Terverifikasi</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Kelola Pembayaran</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Belum ada data pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{payment.userName}</TableCell>
                    <TableCell>{payment.paketNama}</TableCell>
                    <TableCell>Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="uppercase">{payment.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                    <TableCell>
                      {payment.paymentProofUrl ? (
                        <a 
                          href={payment.paymentProofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Lihat <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.paymentStatus === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => openVerifyDialog(payment)}
                        >
                          Verifikasi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Pembayaran</DialogTitle>
            <DialogDescription>
              {selectedPayment?.userName} - {selectedPayment?.paketNama} - Rp {selectedPayment?.amount.toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Catatan Admin (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleVerify("rejected")}
              disabled={verifying}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </Button>
            <Button
              onClick={() => handleVerify("verified")}
              disabled={verifying}
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
