
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
            electionVoters: true,
          },
        },
      },
    });
    return NextResponse.json(elections);
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, opensAt, closesAt, numberOfElected } = body;

    if (!title || !opensAt || !closesAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const election = await prisma.election.create({
      data: {
        title,
        opensAt: new Date(opensAt),
        closesAt: new Date(closesAt),
        numberOfElected: numberOfElected || 1,
      },
    });

    return NextResponse.json(election, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
