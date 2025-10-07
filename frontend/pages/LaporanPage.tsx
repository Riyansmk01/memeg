import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function LaporanPage() {
  const backend = useBackend();

  const { data } = useQuery({
    queryKey: ["laporan-monthly"],
    queryFn: async () => backend.laporan.monthly(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan Bulanan</h1>
          <p className="text-muted-foreground mt-1">Analisis produksi dan keuangan per bulan</p>
        </div>

        {data?.reports && data.reports.length > 0 ? (
          <div className="space-y-4">
            {data.reports.map((report) => (
              <Card key={report.month} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    {formatMonth(report.month)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Panen</p>
                      <p className="text-2xl font-bold text-foreground">{report.totalPanen}</p>
                      <p className="text-xs text-muted-foreground mt-1">kali panen</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Berat TBS</p>
                      <p className="text-2xl font-bold text-foreground">{report.totalBeratKg.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendapatan</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(report.totalPendapatan)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Biaya Pupuk</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(report.totalBiayaPupuk)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Laba Bersih</p>
                      <p className={`text-lg font-bold ${report.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(report.netIncome)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Belum ada data laporan</p>
              <p className="text-muted-foreground">Mulai catat panen dan pemupukan untuk melihat laporan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
