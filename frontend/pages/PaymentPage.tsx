import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Copy, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentMethod {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
  isActive: boolean;
}

interface Paket {
  id: number;
  nama: string;
  harga: number;
  maxKebun: number;
  fiturEkspor: boolean;
}

export default function PaymentPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaket, setSelectedPaket] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paketsRes, methodsRes] = await Promise.all([
        backend.paket.list(),
        backend.payment.getMethods()
      ]);
      setPakets(paketsRes.paket);
      setPaymentMethods(methodsRes.methods);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal memuat data",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Tersalin!",
      description: "Nomor rekening berhasil disalin",
    });
  };

  const handleSubmit = async () => {
    if (!selectedPaket || !selectedMethod) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan pilih paket dan metode pembayaran",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await backend.payment.submit({
        paketId: selectedPaket,
        paymentMethod: selectedMethod as "mandiri" | "bri" | "qris",
        paymentProofUrl: paymentProofUrl || undefined,
      });

      toast({
        title: "Berhasil!",
        description: result.message,
      });

      setTimeout(() => {
        navigate("/paket");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal mengirim pembayaran",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPaketData = pakets.find(p => p.id === selectedPaket);
  const selectedMethodData = paymentMethods.find(m => 
    m.bankName.toLowerCase().includes(selectedMethod)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Upgrade Paket</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Paket</CardTitle>
              <CardDescription>Pilih paket langganan yang sesuai dengan kebutuhan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPaket?.toString()} onValueChange={(v) => setSelectedPaket(Number(v))}>
                {pakets.filter(p => p.nama !== 'Free').map((paket) => (
                  <div key={paket.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value={paket.id.toString()} id={`paket-${paket.id}`} />
                    <Label htmlFor={`paket-${paket.id}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{paket.nama}</div>
                      <div className="text-sm text-muted-foreground">
                        Rp {paket.harga.toLocaleString('id-ID')} • {paket.maxKebun} kebun
                        {paket.fiturEkspor && " • Fitur ekspor"}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>Pilih metode pembayaran yang Anda inginkan</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem 
                      value={method.bankName.toLowerCase().includes('mandiri') ? 'mandiri' : method.bankName.toLowerCase().includes('bri') ? 'bri' : 'qris'} 
                      id={`method-${method.id}`} 
                    />
                    <Label htmlFor={`method-${method.id}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{method.bankName}</div>
                      <div className="text-sm text-muted-foreground">{method.accountHolder}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedPaketData && selectedMethodData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-accent rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Paket</div>
                    <div className="font-semibold text-lg">{selectedPaketData.nama}</div>
                  </div>

                  <div className="p-4 bg-accent rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Pembayaran</div>
                    <div className="font-bold text-2xl text-primary">
                      Rp {selectedPaketData.harga.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="p-4 bg-accent rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Transfer ke</div>
                    <div className="font-semibold mb-1">{selectedMethodData.bankName}</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-background rounded border font-mono text-sm">
                        {selectedMethodData.accountNumber}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedMethodData.accountNumber)}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      a.n. {selectedMethodData.accountHolder}
                    </div>
                  </div>

                  {selectedMethodData.qrCodeUrl && (
                    <div className="p-4 bg-accent rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Scan QR Code</div>
                      <img 
                        src={selectedMethodData.qrCodeUrl} 
                        alt="QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Bukti Pembayaran</CardTitle>
                  <CardDescription>Opsional - untuk mempercepat verifikasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="proof">URL Bukti Pembayaran</Label>
                    <Input
                      id="proof"
                      placeholder="https://example.com/bukti-pembayaran.jpg"
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload bukti pembayaran ke cloud storage dan masukkan URL-nya di sini
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Kirim Pembayaran
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {(!selectedPaketData || !selectedMethodData) && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Silakan pilih paket dan metode pembayaran terlebih dahulu
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
