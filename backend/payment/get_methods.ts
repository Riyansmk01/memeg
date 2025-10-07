import { api } from "encore.dev/api";
import db from "../db";

export interface PaymentMethod {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
  isActive: boolean;
}

export interface GetMethodsResponse {
  methods: PaymentMethod[];
}

export const getMethods = api<void, GetMethodsResponse>(
  { auth: true, method: "GET", path: "/payment/methods", expose: true },
  async () => {
    const methodRows = await db.query<{
      id: number;
      bank_name: string;
      account_number: string;
      account_holder: string;
      qr_code_url: string | null;
      is_active: boolean;
    }>`
      SELECT id, bank_name, account_number, account_holder, qr_code_url, is_active
      FROM payment_methods
      WHERE is_active = true
      ORDER BY id
    `;

    const methods: PaymentMethod[] = [];
    for await (const m of methodRows) {
      methods.push({
        id: m.id,
        bankName: m.bank_name,
        accountNumber: m.account_number,
        accountHolder: m.account_holder,
        qrCodeUrl: m.qr_code_url || undefined,
        isActive: m.is_active,
      });
    }

    return { methods };
  }
);
