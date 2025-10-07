import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface MonthlyReport {
  month: string;
  totalPanen: number;
  totalBeratKg: number;
  totalPendapatan: number;
  totalBiayaPupuk: number;
  netIncome: number;
}

export interface MonthlyReportResponse {
  reports: MonthlyReport[];
}

// Retrieves monthly production and financial reports.
export const monthly = api<void, MonthlyReportResponse>(
  { auth: true, expose: true, method: "GET", path: "/laporan/monthly" },
  async () => {
    const auth = getAuthData()!;

    const reports: MonthlyReport[] = [];
    const rows = db.query<MonthlyReport>`
      WITH panen_monthly AS (
        SELECT 
          TO_CHAR(p.tanggal, 'YYYY-MM') as month,
          COUNT(p.id) as total_panen,
          SUM(p.berat_kg) as total_berat_kg,
          SUM(p.total_pendapatan) as total_pendapatan
        FROM panen p
        JOIN kebun k ON p.kebun_id = k.id
        WHERE k.user_id = ${auth.userID}
        GROUP BY TO_CHAR(p.tanggal, 'YYYY-MM')
      ),
      pupuk_monthly AS (
        SELECT 
          TO_CHAR(pu.tanggal, 'YYYY-MM') as month,
          SUM(pu.biaya) as total_biaya_pupuk
        FROM pupuk pu
        JOIN kebun k ON pu.kebun_id = k.id
        WHERE k.user_id = ${auth.userID}
        GROUP BY TO_CHAR(pu.tanggal, 'YYYY-MM')
      )
      SELECT 
        COALESCE(pm.month, pum.month) as month,
        COALESCE(pm.total_panen, 0) as "totalPanen",
        COALESCE(pm.total_berat_kg, 0) as "totalBeratKg",
        COALESCE(pm.total_pendapatan, 0) as "totalPendapatan",
        COALESCE(pum.total_biaya_pupuk, 0) as "totalBiayaPupuk",
        COALESCE(pm.total_pendapatan, 0) - COALESCE(pum.total_biaya_pupuk, 0) as "netIncome"
      FROM panen_monthly pm
      FULL OUTER JOIN pupuk_monthly pum ON pm.month = pum.month
      ORDER BY month DESC
      LIMIT 12
    `;

    for await (const row of rows) {
      reports.push(row);
    }

    return { reports };
  }
);
