
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/security-node";
import argon2 from "argon2";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const voter = await prisma.voter.findUnique({
      where: { email },
    });

    if (!voter || !voter.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    try {
      const isValid = await argon2.verify(voter.password, password);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } catch (_verifyError) {
      return NextResponse.json({ error: "Verification error" }, { status: 500 });
    }

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
