import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    const validPassword =
      user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !validPassword || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createSessionToken();
    const expiresAt = getSessionExpiry();

    await prisma.$transaction([
      prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: hashSessionToken(token),
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Login service is not ready. Check database environment variables." },
      { status: 503 },
    );
  }
}
