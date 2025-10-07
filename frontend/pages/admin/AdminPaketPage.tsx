import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";
import Layout from "../../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function AdminPaketPage() {
  const backend = useBackend();

  const { data } = useQuery({
    queryKey: ["paket"],
    queryFn: async () => backend.paket.list(),
  });

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Paket</h1>
          <p className="text-muted-foreground mt-1">Lihat detail paket langganan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.paket.map((paket) => (
            <Card key={paket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">{paket.nama}</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground mt-4">
                  {paket.harga === 0 ? "Gratis" : `${formatCurrency(paket.harga)}/bulan`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>ID: {paket.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Max Kebun: {paket.maxKebun}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paket.fiturEkspor ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span>Fitur Ekspor: {paket.fiturEkspor ? "Ya" : "Tidak"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>
                      Dibuat:{" "}
                      {new Date(paket.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
