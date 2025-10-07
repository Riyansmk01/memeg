import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UpdateUserRoleRequest {
  userId: string;
  role: "user" | "admin";
}

export interface UpdateUserRoleResponse {
  success: boolean;
}

// Updates a user's role (admin only).
export const updateUserRole = api<UpdateUserRoleRequest, UpdateUserRoleResponse>(
  { auth: true, expose: true, method: "PUT", path: "/admin/users/:userId/role" },
  async (req) => {
    const auth = getAuthData()!;

    if (auth.role !== "admin") {
      throw APIError.permissionDenied("admin access required");
    }

    if (req.userId === auth.userID) {
      throw APIError.invalidArgument("cannot change your own role");
    }

    await db.exec`
      UPDATE users 
      SET role = ${req.role}
      WHERE id = ${req.userId}
    `;

    return { success: true };
  }
);
