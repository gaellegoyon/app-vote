
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const election = await prisma.election.findFirst({
      where: { round: 1 },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        opensAt: true,
        closesAt: true,
        round: true,
      },
    });

    if (!election) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    const now = new Date();
    const isOpen = now >= election.opensAt && now <= election.closesAt;
    const isClosed = now > election.closesAt;
    const isUpcoming = now < election.opensAt;

    let status: "upcoming" | "open" | "closed";
    if (isUpcoming) status = "upcoming";
    else if (isOpen) status = "open";
    else status = "closed";

    return NextResponse.json({
      exists: true,
      election: {
        id: election.id,
        title: election.title,
        round: election.round,
        opensAt: election.opensAt.toISOString(),
        closesAt: election.closesAt.toISOString(),
      },
      status,
      isOpen,
      isClosed,
      isUpcoming,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
