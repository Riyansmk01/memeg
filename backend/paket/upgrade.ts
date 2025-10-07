import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UpgradePackageRequest {
  paketId: number;
}

export interface UpgradePackageResponse {
  success: boolean;
  message: string;
  requiresPayment: boolean;
  paketNama?: string;
  paketHarga?: number;
}

export const upgrade = api<UpgradePackageRequest, UpgradePackageResponse>(
  { auth: true, expose: true, method: "POST", path: "/paket/upgrade" },
  async (req) => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ paket_id: number | null }>`
      SELECT paket_id FROM users WHERE id = ${auth.userID}
    `;

    const paket = await db.queryRow<{ id: number; nama: string; harga: number }>`
      SELECT id, nama, harga FROM paket WHERE id = ${req.paketId}
    `;

    if (!paket) {
      throw APIError.notFound("Paket tidak ditemukan");
    }

    if (user?.paket_id === req.paketId) {
      throw APIError.invalidArgument("Anda sudah menggunakan paket ini");
    }

    const currentPaket = user?.paket_id 
      ? await db.queryRow<{ harga: number }>`SELECT harga FROM paket WHERE id = ${user.paket_id}`
      : null;

    if (currentPaket && paket.harga <= currentPaket.harga) {
      throw APIError.invalidArgument("Anda hanya dapat upgrade ke paket yang lebih tinggi");
    }

    return {
      success: true,
      message: `Silakan lakukan pembayaran untuk upgrade ke paket ${paket.nama}`,
      requiresPayment: true,
      paketNama: paket.nama,
      paketHarga: paket.harga,
    };
  }
);
