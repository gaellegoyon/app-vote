
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import * as argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/security-node";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await argon2.verify(user.pwdHash, password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.totpSecret) {
      const pre = await signToken({ email, stage: "mfa" }, "5m");
      const res = NextResponse.json({ mfa_required: true });
      res.cookies.set("admin_pre", pre, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      });
      return res;
    }

    const jwt = await signToken({ email, role: "admin" }, "8h");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
