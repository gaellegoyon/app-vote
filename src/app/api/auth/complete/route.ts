import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/security";

export async function POST(req: Request) {
  const { token, pwd } = await req.json();
  if (!token || !pwd)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  // token contient par ex. { email: "..." }
  const payload = await verifyToken<{ email: string }>(token);
  const email = payload.email;

  const hash = await hashPassword(pwd);
  await prisma.voter.update({ where: { email }, data: { pwdHash: hash } });

  return NextResponse.json({ ok: true });
}
