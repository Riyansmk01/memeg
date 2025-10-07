import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Kebun } from "./create";

export interface GetKebunRequest {
  id: number;
}

// Retrieves a specific plantation by ID.
export const get = api<GetKebunRequest, Kebun>(
  { auth: true, expose: true, method: "GET", path: "/kebun/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const kebun = await db.queryRow<Kebun>`
      SELECT 
        id, 
        user_id as "userId", 
        nama, 
        luas_ha as "luasHa", 
        jumlah_pohon as "jumlahPohon", 
        lokasi, 
        created_at as "createdAt"
      FROM kebun
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!kebun) {
      throw APIError.notFound("plantation not found");
    }

    return kebun;
  }
);
