
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { electionId } = body;

    if (!electionId) {
      return NextResponse.json({ error: "Missing election ID" }, { status: 400 });
    }

    const parentElection = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!parentElection) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const runoffElection = await prisma.election.create({
      data: {
        title: parentElection.title + " - Runoff",
        round: (parentElection.round || 1) + 1,
        numberOfElected: parentElection.numberOfElected,
        opensAt: parentElection.closesAt,
        closesAt: new Date(parentElection.closesAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        parentId: electionId,
      },
    });

    return NextResponse.json(runoffElection, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
