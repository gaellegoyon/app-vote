
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getActiveElection } from "@/lib/election-utils";

const schema = z.object({
  name: z.string().min(2).max(120),
  program: z.string().min(10).max(5000),
  slogan: z.string().max(140).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const activeElection = await getActiveElection();
    if (!activeElection) {
      return NextResponse.json({ error: "No active election" }, { status: 400 });
    }

    await prisma.candidate.create({
      data: {
        name: parsed.data.name,
        program: parsed.data.program,
        slogan: parsed.data.slogan ?? "",
        validated: false,
        electionId: activeElection.id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
