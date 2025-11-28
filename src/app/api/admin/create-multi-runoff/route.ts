
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentElectionId, candidateIds, opensAt, closesAt } = body;

    if (!parentElectionId || !Array.isArray(candidateIds) || candidateIds.length < 2 || !opensAt || !closesAt) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const parentElection = await prisma.election.findUnique({
      where: { id: parentElectionId },
    });

    if (!parentElection) {
      return NextResponse.json({ error: "Parent election not found" }, { status: 404 });
    }

    const runoffElection = await prisma.election.create({
      data: {
        title: parentElection.title + " - Multi-Runoff",
        round: (parentElection.round || 1) + 1,
        numberOfElected: parentElection.numberOfElected,
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
