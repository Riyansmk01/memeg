import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DashboardStats {
  totalKebun: number;
  totalLuasHa: number;
  totalPohon: number;
  totalPanen: number;
  totalPendapatan: number;
  totalBiayaPupuk: number;
  recentPanen: RecentPanenItem[];
}

export interface RecentPanenItem {
  id: number;
  kebunNama: string;
  tanggal: Date;
  beratKg: number;
  totalPendapatan: number;
}

// Retrieves dashboard statistics for the current user.
export const dashboard = api<void, DashboardStats>(
  { auth: true, expose: true, method: "GET", path: "/laporan/dashboard" },
  async () => {
    const auth = getAuthData()!;

    const stats = await db.queryRow<{
      totalKebun: number;
      totalLuasHa: number;
      totalPohon: number;
      totalPanen: number;
      totalPendapatan: number;
      totalBiayaPupuk: number;
    }>`
      SELECT 
        COALESCE(COUNT(DISTINCT k.id), 0) as "totalKebun",
        COALESCE(SUM(k.luas_ha), 0) as "totalLuasHa",
        COALESCE(SUM(k.jumlah_pohon), 0) as "totalPohon",
        COALESCE(COUNT(p.id), 0) as "totalPanen",
        COALESCE(SUM(p.total_pendapatan), 0) as "totalPendapatan",
        COALESCE(SUM(pu.biaya), 0) as "totalBiayaPupuk"
      FROM kebun k
      LEFT JOIN panen p ON p.kebun_id = k.id
      LEFT JOIN pupuk pu ON pu.kebun_id = k.id
      WHERE k.user_id = ${auth.userID}
    `;

    const recentPanen: RecentPanenItem[] = [];
    const recentRows = db.query<RecentPanenItem>`
      SELECT 
        p.id,
        k.nama as "kebunNama",
        p.tanggal,
        p.berat_kg as "beratKg",
        p.total_pendapatan as "totalPendapatan"
      FROM panen p
      JOIN kebun k ON p.kebun_id = k.id
      WHERE k.user_id = ${auth.userID}
      ORDER BY p.tanggal DESC
      LIMIT 5
    `;

    for await (const row of recentRows) {
      recentPanen.push(row);
    }

    return {
      totalKebun: stats?.totalKebun || 0,
      totalLuasHa: stats?.totalLuasHa || 0,
      totalPohon: stats?.totalPohon || 0,
      totalPanen: stats?.totalPanen || 0,
      totalPendapatan: stats?.totalPendapatan || 0,
      totalBiayaPupuk: stats?.totalBiayaPupuk || 0,
      recentPanen,
    };
  }
);
