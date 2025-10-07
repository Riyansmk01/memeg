import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface Payment {
  id: number;
  userId: string;
  userName: string;
  paketNama: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface ListPaymentsResponse {
  payments: Payment[];
}

export const list = api<void, ListPaymentsResponse>(
  { auth: true, method: "GET", path: "/payment/list", expose: true },
  async () => {
    const auth = getAuthData()!;

    let paymentRows;
    
    if (auth.role === "admin" || (auth as any).role === "super_admin") {
      paymentRows = await db.query<{
        id: number;
        user_id: string;
        user_name: string;
        paket_nama: string;
        amount: number;
        payment_method: string;
        payment_status: string;
        payment_proof_url: string | null;
        admin_notes: string | null;
        created_at: Date;
        verified_at: Date | null;
      }>`
        SELECT 
          p.id, p.user_id, u.name as user_name, pk.nama as paket_nama,
          p.amount, p.payment_method, p.payment_status, p.payment_proof_url,
          p.admin_notes, p.created_at, p.verified_at
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN paket pk ON p.paket_id = pk.id
        ORDER BY p.created_at DESC
      `;
    } else {
      paymentRows = await db.query<{
        id: number;
        user_id: string;
        user_name: string;
        paket_nama: string;
        amount: number;
        payment_method: string;
        payment_status: string;
        payment_proof_url: string | null;
        admin_notes: string | null;
        created_at: Date;
        verified_at: Date | null;
      }>`
        SELECT 
          p.id, p.user_id, u.name as user_name, pk.nama as paket_nama,
          p.amount, p.payment_method, p.payment_status, p.payment_proof_url,
          p.admin_notes, p.created_at, p.verified_at
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN paket pk ON p.paket_id = pk.id
        WHERE p.user_id = ${auth.userID}
        ORDER BY p.created_at DESC
      `;
    }

    const payments: Payment[] = [];
    for await (const p of paymentRows) {
      payments.push({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        paketNama: p.paket_nama,
        amount: p.amount,
        paymentMethod: p.payment_method,
        paymentStatus: p.payment_status,
        paymentProofUrl: p.payment_proof_url || undefined,
        adminNotes: p.admin_notes || undefined,
        createdAt: p.created_at,
        verifiedAt: p.verified_at || undefined,
      });
    }

    return { payments };
  }
);
