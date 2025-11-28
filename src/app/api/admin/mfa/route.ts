
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken, signToken } from "@/lib/security-node";
import { dec } from "@/lib/crypto";
import { verifyTotp } from "@/lib/totp";

const schema = z.object({ code: z.string().min(6).max(8) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const pre = req.headers.get("cookie")?.match(/admin_pre=([^;]+)/)?.[1];
    if (!pre) {
      return NextResponse.json({ error: "No pre-auth token" }, { status: 401 });
    }

    let payload: { email: string; stage?: string };
    try {
      payload = await verifyToken<{ email: string; stage?: string }>(pre);
    } catch (_tokenError) {
      return NextResponse.json({ error: "Pre-auth token expired" }, { status: 401 });
    }

    if (payload.stage !== "mfa") {
      return NextResponse.json({ error: "Invalid auth stage" }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: payload.email },
    });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ error: "MFA not configured" }, { status: 403 });
    }

    const secret = dec(user.totpSecret);
    if (!verifyTotp(parsed.data.code, secret)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const jwt = await signToken({ email: user.email, role: user.role }, "8h");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    res.cookies.set("admin_pre", "", { path: "/", maxAge: 0 });

    return res;
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
