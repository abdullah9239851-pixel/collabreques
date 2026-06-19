import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "collabrequest_session";

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiry() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      refreshTokenHash: hashSessionToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          avatarUrl: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") {
    return null;
  }

  return session.user;
}

export async function getCurrentUserSafe() {
  try {
    return await getCurrentUser();
  } catch (error) {
    console.error("Current user lookup failed", error);
    return null;
  }
}
