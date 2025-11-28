
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/security-node";
import { getOpenElection } from "@/lib/election-utils";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const voterToken = cookieHeader
      .split(";")
      .find((cookie) => cookie.trim().startsWith("voter_session="))
      ?.split("=")[1];

    if (!voterToken) {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }

    let voterSession;
    try {
      voterSession = await verifyToken(voterToken);
    } catch (_tokenError) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const voterEmail = voterSession.email as string;
    const openElection = await getOpenElection();

    if (!openElection) {
      return NextResponse.json({
        hasVoted: false,
        votedAt: null,
      });
    }

    const voter = await prisma.voter.findUnique({
      where: { email: voterEmail },
    });

    if (!voter) {
      return NextResponse.json({ error: "Voter not found" }, { status: 404 });
    }

    const electionVoter = await prisma.electionVoter.findUnique({
      where: {
        electionId_voterId: {
          electionId: openElection.id,
          voterId: voter.id,
        },
      },
    });

    if (!electionVoter) {
      return NextResponse.json({
        hasVoted: false,
        votedAt: null,
        authorized: false,
      });
    }

    return NextResponse.json({
      hasVoted: !!electionVoter.votedAt,
      votedAt: electionVoter.votedAt,
      authorized: true,
      election: {
        id: openElection.id,
        title: openElection.title,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
