import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreatePupukRequest {
  kebunId: number;
  tanggal: Date;
  jenisPupuk: string;
  biaya: number;
}

export interface Pupuk {
  id: number;
  kebunId: number;
  tanggal: Date;
  jenisPupuk: string;
  biaya: number;
  createdAt: Date;
}

// Creates a new fertilizer record.
export const create = api<CreatePupukRequest, Pupuk>(
  { auth: true, expose: true, method: "POST", path: "/pupuk" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.jenisPupuk || req.jenisPupuk.trim().length === 0) {
      throw APIError.invalidArgument("jenisPupuk cannot be empty");
    }

    if (req.biaya <= 0) {
      throw APIError.invalidArgument("biaya must be greater than 0");
    }

    // Verify kebun ownership
    const kebun = await db.queryRow<{ id: number }>`
      SELECT id FROM kebun WHERE id = ${req.kebunId} AND user_id = ${auth.userID}
    `;

    if (!kebun) {
      throw APIError.notFound("plantation not found");
    }

    const pupuk = await db.queryRow<Pupuk>`
      INSERT INTO pupuk (kebun_id, tanggal, jenis_pupuk, biaya)
      VALUES (${req.kebunId}, ${req.tanggal}, ${req.jenisPupuk}, ${req.biaya})
      RETURNING 
        id, 
        kebun_id as "kebunId", 
        tanggal, 
        jenis_pupuk as "jenisPupuk", 
        biaya,
        created_at as "createdAt"
    `;

    if (!pupuk) {
      throw APIError.internal("failed to create fertilizer record");
    }

    return pupuk;
  }
);
