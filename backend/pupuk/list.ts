import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Query } from "encore.dev/api";
import db from "../db";

export interface PupukListItem {
  id: number;
  kebunId: number;
  kebunNama: string;
  tanggal: Date;
  jenisPupuk: string;
  biaya: number;
  createdAt: Date;
}

export interface ListPupukRequest {
  kebunId?: Query<number>;
}

export interface ListPupukResponse {
  pupuk: PupukListItem[];
}

// Retrieves all fertilizer records for the current user.
export const list = api<ListPupukRequest, ListPupukResponse>(
  { auth: true, expose: true, method: "GET", path: "/pupuk" },
  async (req) => {
    const auth = getAuthData()!;

    const pupuk: PupukListItem[] = [];
    
    if (req.kebunId !== undefined) {
      const rows = db.query<PupukListItem>`
        SELECT 
          p.id,
          p.kebun_id as "kebunId",
          k.nama as "kebunNama",
          p.tanggal,
          p.jenis_pupuk as "jenisPupuk",
          p.biaya,
          p.created_at as "createdAt"
        FROM pupuk p
        JOIN kebun k ON p.kebun_id = k.id
        WHERE k.user_id = ${auth.userID} AND p.kebun_id = ${req.kebunId}
        ORDER BY p.tanggal DESC
      `;

      for await (const row of rows) {
        pupuk.push(row);
      }
    } else {
      const rows = db.query<PupukListItem>`
        SELECT 
          p.id,
          p.kebun_id as "kebunId",
          k.nama as "kebunNama",
          p.tanggal,
          p.jenis_pupuk as "jenisPupuk",
          p.biaya,
          p.created_at as "createdAt"
        FROM pupuk p
        JOIN kebun k ON p.kebun_id = k.id
        WHERE k.user_id = ${auth.userID}
        ORDER BY p.tanggal DESC
      `;

      for await (const row of rows) {
        pupuk.push(row);
      }
    }

    return { pupuk };
  }
);
