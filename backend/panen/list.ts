import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Query } from "encore.dev/api";
import db from "../db";

export interface PanenListItem {
  id: number;
  kebunId: number;
  kebunNama: string;
  tanggal: Date;
  beratKg: number;
  hargaPerKg: number;
  totalPendapatan: number;
  createdAt: Date;
}

export interface ListPanenRequest {
  kebunId?: Query<number>;
}

export interface ListPanenResponse {
  panen: PanenListItem[];
}

// Retrieves all harvest records for the current user.
export const list = api<ListPanenRequest, ListPanenResponse>(
  { auth: true, expose: true, method: "GET", path: "/panen" },
  async (req) => {
    const auth = getAuthData()!;

    const panen: PanenListItem[] = [];
    
    if (req.kebunId !== undefined) {
      const rows = db.query<PanenListItem>`
        SELECT 
          p.id,
          p.kebun_id as "kebunId",
          k.nama as "kebunNama",
          p.tanggal,
          p.berat_kg as "beratKg",
          p.harga_per_kg as "hargaPerKg",
          p.total_pendapatan as "totalPendapatan",
          p.created_at as "createdAt"
        FROM panen p
        JOIN kebun k ON p.kebun_id = k.id
        WHERE k.user_id = ${auth.userID} AND p.kebun_id = ${req.kebunId}
        ORDER BY p.tanggal DESC
      `;

      for await (const row of rows) {
        panen.push(row);
      }
    } else {
      const rows = db.query<PanenListItem>`
        SELECT 
          p.id,
          p.kebun_id as "kebunId",
          k.nama as "kebunNama",
          p.tanggal,
          p.berat_kg as "beratKg",
          p.harga_per_kg as "hargaPerKg",
          p.total_pendapatan as "totalPendapatan",
          p.created_at as "createdAt"
        FROM panen p
        JOIN kebun k ON p.kebun_id = k.id
        WHERE k.user_id = ${auth.userID}
        ORDER BY p.tanggal DESC
      `;

      for await (const row of rows) {
        panen.push(row);
      }
    }

    return { panen };
  }
);
