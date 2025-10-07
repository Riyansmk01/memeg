import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface KebunListItem {
  id: number;
  nama: string;
  luasHa: number;
  jumlahPohon: number;
  lokasi: string | null;
  totalPanen: number;
  totalPendapatan: number;
  createdAt: Date;
}

export interface ListKebunResponse {
  kebun: KebunListItem[];
}

// Retrieves all plantations for the current user.
export const list = api<void, ListKebunResponse>(
  { auth: true, expose: true, method: "GET", path: "/kebun" },
  async () => {
    const auth = getAuthData()!;

    const kebun: KebunListItem[] = [];
    const rows = db.query<KebunListItem>`
      SELECT 
        k.id,
        k.nama,
        k.luas_ha as "luasHa",
        k.jumlah_pohon as "jumlahPohon",
        k.lokasi,
        COALESCE(COUNT(p.id), 0) as "totalPanen",
        COALESCE(SUM(p.total_pendapatan), 0) as "totalPendapatan",
        k.created_at as "createdAt"
      FROM kebun k
      LEFT JOIN panen p ON p.kebun_id = k.id
      WHERE k.user_id = ${auth.userID}
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `;

    for await (const row of rows) {
      kebun.push(row);
    }

    return { kebun };
  }
);
