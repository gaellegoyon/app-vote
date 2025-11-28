
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ ok: true });

    const cookiesToClear = ["admin_session", "admin_pre", "voter_session"];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    });

    return response;
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
