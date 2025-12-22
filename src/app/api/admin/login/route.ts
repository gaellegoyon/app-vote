import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/security-node";
import { authenticateWithLDAP } from "@/lib/ldap";
import { logAdminLogin, getClientIp } from "@/lib/audit-log";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Extraire le uid du email (avant @)
    const uid = email.split("@")[0];

    // 1️⃣ Authentifier via LDAP
    try {
      await authenticateWithLDAP(uid, password);
    } catch (ldapError) {
      console.error("LDAP auth failed:", ldapError);
      await logAdminLogin(email, "failure", clientIp, {
        reason: "invalid_credentials",
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 2️⃣ Vérifier que l'utilisateur est admin en DB
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      await logAdminLogin(email, "failure", clientIp, {
        reason: "admin_not_found",
      });
      return NextResponse.json(
        { error: "Admin access denied" },
        { status: 403 }
      );
    }

    // 3️⃣ Vérifier TOTP si configuré
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
      await logAdminLogin(email, "success", clientIp, { mfa_required: true });
      return res;
    }

    // 4️⃣ Générer JWT et créer session
    const jwt = await signToken({ email, role: "admin" }, "8h");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    await logAdminLogin(email, "success", clientIp);
    return res;
  } catch (error) {
    console.error("[AdminLogin] Error:", error);
    await logAdminLogin("unknown", "failure", clientIp, {
      reason: "server_error",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
