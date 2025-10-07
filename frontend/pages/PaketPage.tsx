import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, Crown, Zap } from "lucide-react";

export default function PaketPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => backend.user.getProfile(),
  });

  const { data } = useQuery({
    queryKey: ["paket"],
    queryFn: async () => backend.paket.list(),
  });

  const upgradeMutation = useMutation({
    mutationFn: async (paketId: number) => backend.paket.upgrade({ paketId }),
    onSuccess: (result) => {
      if (result.requiresPayment) {
        toast({
          title: "Lanjutkan Pembayaran",
          description: result.message,
        });
        navigate("/payment");
      } else {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast({ title: "Paket berhasil diperbarui" });
      }
    },
    onError: (error: Error) => {
      console.error(error);
      toast({ title: "Gagal memperbarui paket", description: error.message, variant: "destructive" });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPaketIcon = (nama: string) => {
    if (nama === "Pro") return Crown;
    if (nama === "Basic") return Zap;
    return Check;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paket Langganan</h1>
          <p className="text-muted-foreground mt-1">Pilih paket yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Paket Aktif:</strong> {profile?.paketName} • Max {profile?.maxKebun} kebun
            {profile?.fiturEkspor && " • Fitur ekspor data tersedia"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.paket.map((paket) => {
            const Icon = getPaketIcon(paket.nama);
            const isCurrentPaket = profile?.paketName === paket.nama;
            const isPro = paket.nama === "Pro";

            return (
              <Card
                key={paket.id}
                className={`hover:shadow-xl transition-all ${isPro ? "border-2 border-amber-500" : ""}`}
              >
                {isPro && (
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                    Paling Populer
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{paket.nama}</CardTitle>
                    <Icon className={`h-8 w-8 ${isPro ? "text-amber-500" : "text-green-600"}`} />
                  </div>
                  <CardDescription className="text-3xl font-bold text-foreground mt-4">
                    {paket.harga === 0 ? "Gratis" : `${formatCurrency(paket.harga)}/bulan`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Maksimal {paket.maxKebun} kebun</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Catatan panen unlimited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Laporan bulanan</span>
                  </div>
                  {paket.fiturEkspor && (
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold">Ekspor data (PDF/Excel)</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isCurrentPaket ? (
                    <Button className="w-full" disabled>
                      Paket Aktif
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPro ? "default" : "outline"}
                      onClick={() => upgradeMutation.mutate(paket.id)}
                    >
                      {paket.harga === 0 ? "Pilih Paket" : "Upgrade"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
