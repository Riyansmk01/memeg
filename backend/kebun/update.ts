import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Kebun } from "./create";

export interface UpdateKebunRequest {
  id: number;
  nama: string;
  luasHa: number;
  jumlahPohon: number;
  lokasi?: string;
}

// Updates a plantation.
export const update = api<UpdateKebunRequest, Kebun>(
  { auth: true, expose: true, method: "PUT", path: "/kebun/:id" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.nama || req.nama.trim().length === 0) {
      throw APIError.invalidArgument("nama cannot be empty");
    }

    if (req.luasHa <= 0) {
      throw APIError.invalidArgument("luasHa must be greater than 0");
    }

    if (req.jumlahPohon <= 0) {
      throw APIError.invalidArgument("jumlahPohon must be greater than 0");
    }

    const kebun = await db.queryRow<Kebun>`
      UPDATE kebun
      SET 
        nama = ${req.nama},
        luas_ha = ${req.luasHa},
        jumlah_pohon = ${req.jumlahPohon},
        lokasi = ${req.lokasi || null}
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING 
        id, 
        user_id as "userId", 
        nama, 
        luas_ha as "luasHa", 
        jumlah_pohon as "jumlahPohon", 
        lokasi, 
        created_at as "createdAt"
    `;

    if (!kebun) {
      throw APIError.notFound("plantation not found");
    }

    return kebun;
  }
);
