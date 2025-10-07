import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface VerifyPaymentRequest {
  paymentId: number;
  status: "verified" | "rejected";
  adminNotes?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export const verify = api<VerifyPaymentRequest, VerifyPaymentResponse>(
  { auth: true, method: "POST", path: "/payment/verify", expose: true },
  async (req) => {
    const auth = getAuthData()!;

    if (auth.role !== "admin" && (auth as any).role !== "super_admin") {
      throw APIError.permissionDenied("Hanya admin yang dapat memverifikasi pembayaran");
    }

    const payment = await db.queryRow<{ 
      id: number; 
      user_id: string; 
      paket_id: number;
      payment_status: string;
    }>`
      SELECT id, user_id, paket_id, payment_status 
      FROM payments 
      WHERE id = ${req.paymentId}
    `;

    if (!payment) {
      throw APIError.notFound("Pembayaran tidak ditemukan");
    }

    if (payment.payment_status !== "pending") {
      throw APIError.invalidArgument("Pembayaran sudah diproses sebelumnya");
    }

    await db.exec`
      UPDATE payments
      SET payment_status = ${req.status},
          admin_notes = ${req.adminNotes || null},
          verified_at = NOW(),
          verified_by = ${auth.userID}
      WHERE id = ${req.paymentId}
    `;

    if (req.status === "verified") {
      await db.exec`
        UPDATE subscriptions
        SET is_active = false
        WHERE user_id = ${payment.user_id} AND is_active = true
      `;

      await db.exec`
        INSERT INTO subscriptions (user_id, paket_id, start_date, is_active)
        VALUES (${payment.user_id}, ${payment.paket_id}, NOW(), true)
      `;

      await db.exec`
        UPDATE users
        SET paket_id = ${payment.paket_id}
        WHERE id = ${payment.user_id}
      `;
    }

    return {
      success: true,
      message: req.status === "verified" 
        ? "Pembayaran berhasil diverifikasi dan paket telah diaktifkan" 
        : "Pembayaran ditolak",
    };
  }
);
