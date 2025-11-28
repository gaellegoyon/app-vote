

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const voters = await prisma.voter.findMany({
      select: {
        id: true,
        email: true,
        invitedAt: true,
        votedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(voters);
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Email list required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(
      (email) => typeof email === "string" && emailRegex.test(email.trim())
    );

    if (validEmails.length === 0) {
      return NextResponse.json({ error: "No valid emails" }, { status: 400 });
    }

    const results = await Promise.allSettled(
      validEmails.map((email) =>
        prisma.voter.upsert({
          where: { email: email.trim().toLowerCase() },
          create: { email: email.trim().toLowerCase() },
          update: {},
        })
      )
    );

    const created = results.filter((r) => r.status === "fulfilled").length;
    const errors = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      created,
      errors,
      total: validEmails.length,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
