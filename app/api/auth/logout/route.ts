import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, hashSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: {
          refreshTokenHash: hashSessionToken(token),
        },
      });
    }
  } catch (error) {
    console.error("Logout session cleanup failed", error);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
