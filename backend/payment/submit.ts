import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface SubmitPaymentRequest {
  paketId: number;
  paymentMethod: "mandiri" | "bri" | "qris";
  paymentProofUrl?: string;
}

export interface SubmitPaymentResponse {
  paymentId: number;
  status: string;
  message: string;
}

export const submit = api<SubmitPaymentRequest, SubmitPaymentResponse>(
  { auth: true, method: "POST", path: "/payment/submit", expose: true },
  async (req) => {
    const auth = getAuthData()!;

    const paket = await db.queryRow<{ id: number; harga: number; nama: string }>`
      SELECT id, harga, nama FROM paket WHERE id = ${req.paketId}
    `;

    if (!paket) {
      throw APIError.notFound("Paket tidak ditemukan");
    }

    const payment = await db.queryRow<{ id: number }>`
      INSERT INTO payments (user_id, paket_id, amount, payment_method, payment_proof_url, payment_status)
      VALUES (${auth.userID}, ${req.paketId}, ${paket.harga}, ${req.paymentMethod}, ${req.paymentProofUrl || null}, 'pending')
      RETURNING id
    `;

    return {
      paymentId: payment!.id,
      status: "pending",
      message: "Pembayaran Anda sedang diproses. Silakan tunggu verifikasi dari admin.",
    };
  }
);
