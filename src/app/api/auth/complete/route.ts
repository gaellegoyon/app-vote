
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, signToken } from "@/lib/security-node";
import argon2 from "argon2";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const token = authHeader.substring(7);
    let payload: { email: string; jti: string };
    try {
      payload = await verifyToken(token);
    } catch (_tokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const row = await prisma.inviteToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!row) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      email: payload.email,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, passwordConfirm } = body;

    if (!token || !password || password !== passwordConfirm) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    let payload: { email: string; jti: string };
    try {
      payload = await verifyToken(token);
    } catch (_tokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const inviteRow = await prisma.inviteToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!inviteRow) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const pwdHash = await argon2.hash(password);

    const voter = await prisma.voter.update({
      where: { email: payload.email },
      data: {
        password: pwdHash,
        isActive: true,
      },
    });

    const jwt = await signToken({ email: voter.email, role: "voter" }, "2h");
    const res = NextResponse.json({ ok: true });

    res.cookies.set("voter_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return res;
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
