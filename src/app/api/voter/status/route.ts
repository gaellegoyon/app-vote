
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/security-node";

// Route simple pour vérifier le statut votant côté client
export async function GET(req: Request) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const voterToken = cookies.match(/voter_session=([^;]+)/)?.[1];

    if (!voterToken) {
      return NextResponse.json({ error: "No voter session" }, { status: 401 });
    }

    const session = await verifyToken<{ email: string; role: string }>(
      voterToken
    );

    if (session.role !== "voter") {
      return NextResponse.json({ error: "Not voter" }, { status: 403 });
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
