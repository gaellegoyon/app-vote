import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hmacPseudo } from "@/lib/security-node";
import { verifyToken } from "@/lib/security-node";

export async function POST(req: NextRequest) {
  try {
    const { electionId, candidateId } = await req.json();

    if (!electionId || !candidateId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const cookieHeader = req.headers.get("cookie") || "";
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
    const voter = await prisma.voter.findUnique({
      where: { email: voterEmail },
    });

    if (!voter) {
      return NextResponse.json({ error: "Voter not found" }, { status: 404 });
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < election.opensAt || now > election.closesAt) {
      return NextResponse.json({ error: "Election not open" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.electionId !== electionId) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const electionVoter = await prisma.electionVoter.findUnique({
      where: {
        electionId_voterId: {
          electionId,
          voterId: voter.id,
        },
      },
    });

    if (!electionVoter) {
      return NextResponse.json({ error: "Not invited" }, { status: 403 });
    }

    if (electionVoter.votedAt) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    const pseudo = hmacPseudo(voter.email);
    const payloadEnc = Buffer.alloc(32);

    await prisma.$transaction(async (tx) => {
      await tx.ballot.create({
        data: {
          electionId,
          candidateId,
          voterPseudo: pseudo,
          payloadEnc,
        },
      });

      await tx.electionVoter.update({
        where: {
          electionId_voterId: {
            electionId,
            voterId: voter.id,
          },
        },
        data: { votedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
