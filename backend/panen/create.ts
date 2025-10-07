import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreatePanenRequest {
  kebunId: number;
  tanggal: Date;
  beratKg: number;
  hargaPerKg: number;
}

export interface Panen {
  id: number;
  kebunId: number;
  tanggal: Date;
  beratKg: number;
  hargaPerKg: number;
  totalPendapatan: number;
  createdAt: Date;
}

// Creates a new harvest record.
export const create = api<CreatePanenRequest, Panen>(
  { auth: true, expose: true, method: "POST", path: "/panen" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.beratKg <= 0) {
      throw APIError.invalidArgument("beratKg must be greater than 0");
    }

    if (req.hargaPerKg <= 0) {
      throw APIError.invalidArgument("hargaPerKg must be greater than 0");
    }

    // Verify kebun ownership
    const kebun = await db.queryRow<{ id: number }>`
      SELECT id FROM kebun WHERE id = ${req.kebunId} AND user_id = ${auth.userID}
    `;

    if (!kebun) {
      throw APIError.notFound("plantation not found");
    }

    const panen = await db.queryRow<Panen>`
      INSERT INTO panen (kebun_id, tanggal, berat_kg, harga_per_kg)
      VALUES (${req.kebunId}, ${req.tanggal}, ${req.beratKg}, ${req.hargaPerKg})
      RETURNING 
        id, 
        kebun_id as "kebunId", 
        tanggal, 
        berat_kg as "beratKg", 
        harga_per_kg as "hargaPerKg", 
        total_pendapatan as "totalPendapatan",
        created_at as "createdAt"
    `;

    if (!panen) {
      throw APIError.internal("failed to create harvest record");
    }

    return panen;
  }
);
