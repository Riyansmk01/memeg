import { createClerkClient, verifyToken } from "@clerk/backend";
import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import db from "../db";

const clerkSecretKey = secret("sk_test_DNP8cdQlTESBCjVEG7x1TEB5nPm1HjymAtfS3mzCiq");
const clerkClient = createClerkClient({ secretKey: clerkSecretKey() });

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: "user" | "admin";
}

const AUTHORIZED_PARTIES = ["https://*.lp.dev"];

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      const verifiedToken = await verifyToken(token, {
        authorizedParties: AUTHORIZED_PARTIES,
        secretKey: clerkSecretKey(),
      });

      const clerkUser = await clerkClient.users.getUser(verifiedToken.sub);
      const userEmail = clerkUser.emailAddresses[0].emailAddress;
      
      let user = await db.queryRow<{ id: string; email: string; role: string }>`
        SELECT id, email, role FROM users WHERE id = ${clerkUser.id}
      `;

      if (!user) {
        const superAdminConfig = await db.queryRow<{ email: string }>`
          SELECT email FROM super_admin_config WHERE email = ${userEmail}
        `;

        const freePaket = await db.queryRow<{ id: number }>`
          SELECT id FROM paket WHERE nama = 'Free' LIMIT 1
        `;

        const userRole = superAdminConfig ? 'super_admin' : 'user';

        await db.exec`
          INSERT INTO users (id, name, email, role, paket_id)
          VALUES (${clerkUser.id}, ${clerkUser.firstName || userEmail}, ${userEmail}, ${userRole}, ${freePaket!.id})
        `;

        user = {
          id: clerkUser.id,
          email: userEmail,
          role: userRole
        };
      }

      return {
        userID: user.id,
        email: user.email,
        role: user.role as "user" | "admin",
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err as Error);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
