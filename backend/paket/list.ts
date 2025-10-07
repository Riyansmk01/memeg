import { api } from "encore.dev/api";
import db from "../db";

export interface PaketItem {
  id: number;
  nama: string;
  harga: number;
  maxKebun: number;
  fiturEkspor: boolean;
  createdAt: Date;
}

export interface ListPaketResponse {
  paket: PaketItem[];
}

// Retrieves all available subscription packages.
export const list = api<void, ListPaketResponse>(
  { expose: true, method: "GET", path: "/paket" },
  async () => {
    const paket: PaketItem[] = [];
    const rows = db.query<PaketItem>`
      SELECT 
        id,
        nama,
        harga,
        max_kebun as "maxKebun",
        fitur_ekspor as "fiturEkspor",
        created_at as "createdAt"
      FROM paket
      ORDER BY harga ASC
    `;

    for await (const row of rows) {
      paket.push(row);
    }

    return { paket };
  }
);
