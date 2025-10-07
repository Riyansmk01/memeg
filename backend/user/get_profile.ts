import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  paketName: string;
  paketHarga: number;
  maxKebun: number;
  fiturEkspor: boolean;
  kebunCount: number;
  createdAt: Date;
}

export const getProfile = api<void, UserProfile>(
  { auth: true, expose: true, method: "GET", path: "/user/profile" },
  async () => {
    const auth = getAuthData()!;

    const profile = await db.queryRow<{
      id: string;
      name: string;
      email: string;
      role: string;
      paketName: string;
      paketHarga: number;
      maxKebun: number;
      fiturEkspor: boolean;
      createdAt: Date;
    }>`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        p.nama as "paketName",
        p.harga as "paketHarga",
        p.max_kebun as "maxKebun",
        p.fitur_ekspor as "fiturEkspor",
        u.created_at as "createdAt"
      FROM users u
      LEFT JOIN paket p ON u.paket_id = p.id
      WHERE u.id = ${auth.userID}
    `;

    if (!profile) {
      throw new Error("User not found");
    }

    const kebunCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int as count FROM kebun WHERE user_id = ${auth.userID}
    `;

    return {
      ...profile,
      kebunCount: kebunCount?.count || 0,
    };
  }
);
