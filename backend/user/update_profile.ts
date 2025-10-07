import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UpdateProfileRequest {
  name: string;
}

export interface UpdateProfileResponse {
  success: boolean;
}

// Updates the current user's profile name.
export const updateProfile = api<UpdateProfileRequest, UpdateProfileResponse>(
  { auth: true, expose: true, method: "PUT", path: "/user/profile" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.name || req.name.trim().length === 0) {
      throw APIError.invalidArgument("name cannot be empty");
    }

    await db.exec`
      UPDATE users 
      SET name = ${req.name}
      WHERE id = ${auth.userID}
    `;

    return { success: true };
  }
);
