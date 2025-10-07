import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeletePanenRequest {
  id: number;
}

export interface DeletePanenResponse {
  success: boolean;
}

// Deletes a harvest record.
export const deletePanen = api<DeletePanenRequest, DeletePanenResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/panen/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const result = await db.queryRow<{ id: number }>`
      DELETE FROM panen
      WHERE id = ${req.id} 
        AND kebun_id IN (SELECT id FROM kebun WHERE user_id = ${auth.userID})
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("harvest record not found");
    }

    return { success: true };
  }
);
