
import { NextResponse } from "next/server";
import { getActiveElection } from "@/lib/election-utils";

export async function GET() {
  try {
    const election = await getActiveElection();
    return NextResponse.json({ election });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
