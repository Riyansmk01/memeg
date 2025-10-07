import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeletePupukRequest {
  id: number;
}

export interface DeletePupukResponse {
  success: boolean;
}

// Deletes a fertilizer record.
export const deletePupuk = api<DeletePupukRequest, DeletePupukResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/pupuk/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const result = await db.queryRow<{ id: number }>`
      DELETE FROM pupuk
      WHERE id = ${req.id} 
        AND kebun_id IN (SELECT id FROM kebun WHERE user_id = ${auth.userID})
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("fertilizer record not found");
    }

    return { success: true };
  }
);
