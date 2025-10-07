import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeleteKebunRequest {
  id: number;
}

export interface DeleteKebunResponse {
  success: boolean;
}

// Deletes a plantation.
export const deleteKebun = api<DeleteKebunRequest, DeleteKebunResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/kebun/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const result = await db.queryRow<{ id: number }>`
      DELETE FROM kebun
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("plantation not found");
    }

    return { success: true };
  }
);
