import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Package, DollarSign, Sprout, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const backend = useBackend();

  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => backend.laporan.dashboard(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const netIncome = (stats?.totalPendapatan || 0) - (stats?.totalBiayaPupuk || 0);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan data kebun sawit Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Kebun</CardTitle>
              <TreePine className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.totalKebun || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.totalLuasHa.toFixed(2) || 0} Ha • {stats?.totalPohon.toLocaleString("id-ID") || 0} pohon
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Panen</CardTitle>
              <Package className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.totalPanen || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Catatan panen tersimpan</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalPendapatan || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Dari semua panen</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Biaya Pupuk</CardTitle>
              <Sprout className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalBiayaPupuk || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total pengeluaran</p>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Pendapatan Bersih</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Pendapatan - Biaya Pupuk</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panen Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentPanen && stats.recentPanen.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPanen.map((panen) => (
                  <div key={panen.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{panen.kebunNama}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(panen.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{panen.beratKg.toFixed(2)} kg</p>
                      <p className="text-sm text-green-600">{formatCurrency(panen.totalPendapatan)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Belum ada catatan panen</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
