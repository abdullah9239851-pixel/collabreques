import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionExpiry, hashSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "No active session." }, { status: 401 });
    }

    const tokenHash = hashSessionToken(token);
    const currentSession = await prisma.session.findUnique({
      where: {
        refreshTokenHash: tokenHash,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (
      !currentSession ||
      currentSession.expiresAt <= new Date() ||
      currentSession.user.status !== "ACTIVE"
    ) {
      const response = NextResponse.json({ error: "Session is no longer active." }, { status: 401 });
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    const expiresAt = getSessionExpiry();
    const session = await prisma.session.update({
      where: {
        refreshTokenHash: tokenHash,
      },
      data: {
        expiresAt,
        lastHeartbeatAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      user: session.user,
      expiresAt,
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
    console.error("Session refresh failed", error);
    return NextResponse.json(
      { error: "Session refresh service is not ready. Check database environment variables." },
      { status: 503 },
    );
  }
}
