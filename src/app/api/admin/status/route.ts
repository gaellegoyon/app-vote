
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/security-node";

// Route simple pour vérifier le statut admin côté client
export async function GET(req: Request) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const adminToken = cookies.match(/admin_session=([^;]+)/)?.[1];

    if (!adminToken) {
      return NextResponse.json({ error: "No admin session" }, { status: 401 });
    }

    const session = await verifyToken<{ email: string; role: string }>(
      adminToken
    );

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Not admin" }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      email: session.email,
      role: session.role,
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
