import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { checkRateLimit, validateInput, validateNumber, sanitizeString } from "../middleware/security";

export interface CreateKebunRequest {
  nama: string;
  luasHa: number;
  jumlahPohon: number;
  lokasi?: string;
}

export interface Kebun {
  id: number;
  userId: string;
  nama: string;
  luasHa: number;
  jumlahPohon: number;
  lokasi: string | null;
  createdAt: Date;
}

// Creates a new plantation.
export const create = api<CreateKebunRequest, Kebun>(
  { auth: true, expose: true, method: "POST", path: "/kebun" },
  async (req) => {
    const auth = getAuthData()!;

    await checkRateLimit(auth.userID, '/kebun/create', 10);

    validateInput(req.nama, 'Nama kebun', 3, 100);
    validateNumber(req.luasHa, 'Luas kebun', 0.01);
    validateNumber(req.jumlahPohon, 'Jumlah pohon', 1);
    
    if (req.lokasi) {
      validateInput(req.lokasi, 'Lokasi', 3, 255);
    }

    const nama = sanitizeString(req.nama);
    const lokasi = req.lokasi ? sanitizeString(req.lokasi) : null;

    // Check user's package limit
    const userPackage = await db.queryRow<{ maxKebun: number; currentCount: number }>`
      SELECT 
        p.max_kebun as "maxKebun",
        COALESCE(COUNT(k.id), 0) as "currentCount"
      FROM users u
      LEFT JOIN paket p ON u.paket_id = p.id
      LEFT JOIN kebun k ON k.user_id = u.id
      WHERE u.id = ${auth.userID}
      GROUP BY p.max_kebun
    `;

    if (!userPackage) {
      throw APIError.internal("user package not found");
    }

    if (userPackage.currentCount >= userPackage.maxKebun) {
      throw APIError.resourceExhausted("plantation limit reached for your package");
    }

    const kebun = await db.queryRow<Kebun>`
      INSERT INTO kebun (user_id, nama, luas_ha, jumlah_pohon, lokasi)
      VALUES (${auth.userID}, ${nama}, ${req.luasHa}, ${req.jumlahPohon}, ${lokasi})
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
      throw APIError.internal("failed to create plantation");
    }

    return kebun;
  }
);
