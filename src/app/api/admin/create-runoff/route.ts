
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentElectionId, candidate1Id, candidate2Id, opensAt, closesAt } = body;

    if (!parentElectionId || !candidate1Id || !candidate2Id || !opensAt || !closesAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parentElection = await prisma.election.findUnique({
      where: { id: parentElectionId },
    });

    if (!parentElection) {
      return NextResponse.json({ error: "Parent election not found" }, { status: 404 });
    }

    const runoffElection = await prisma.election.create({
      data: {
        title: parentElection.title + " - Runoff",
        round: (parentElection.round || 1) + 1,
        numberOfElected: 1,
        opensAt: new Date(opensAt),
        closesAt: new Date(closesAt),
        parentId: parentElectionId,
      },
    });

    return NextResponse.json({
      success: true,
      runoffElectionId: runoffElection.id,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
