import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  paketName: string;
  createdAt: Date;
}

export interface ListUsersResponse {
  users: UserListItem[];
}

// Lists all users in the system (admin only).
export const listUsers = api<void, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/users" },
  async () => {
    const auth = getAuthData()!;

    if (auth.role !== "admin") {
      throw APIError.permissionDenied("admin access required");
    }

    const users: UserListItem[] = [];
    const rows = db.query<UserListItem>`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        p.nama as "paketName",
        u.created_at as "createdAt"
      FROM users u
      LEFT JOIN paket p ON u.paket_id = p.id
      ORDER BY u.created_at DESC
    `;

    for await (const row of rows) {
      users.push(row);
    }

    return { users };
  }
);
