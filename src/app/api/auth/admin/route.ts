import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/security-node";
import { authenticateWithLDAP } from "@/lib/ldap";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Extraire le uid du email (avant @)
    const uid = email.split("@")[0];

    // 1️⃣ Authentifier via LDAP
    try {
      await authenticateWithLDAP(uid, password);
    } catch (ldapError) {
      console.error("LDAP auth failed:", ldapError);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 2️⃣ Vérifier que l'utilisateur est admin en DB
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied" },
        { status: 403 }
      );
    }

    const token = await signToken(
      { email: admin.email, role: admin.role, iat: Date.now() },
      "24h"
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
