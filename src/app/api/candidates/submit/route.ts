import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  program: z.string().min(10).max(5000),
  slogan: z.string().max(140).optional(),
});

export async function POST(req: Request) {
  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.candidate.create({
    data: {
      name: parsed.data.name,
      program: parsed.data.program,
      slogan: parsed.data.slogan ?? "",
      validated: false,
    },
  });
  return NextResponse.json({ ok: true });
}
