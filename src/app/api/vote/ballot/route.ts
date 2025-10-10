import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hmacPseudo } from "@/lib/security";

export async function POST(req: Request) {
  const { electionId, candidateId } = await req.json();

  // TODO: remplacer par la vraie session votant
  const voterEmail = "etudiant@example.com";

  const voter = await prisma.voter.findUnique({ where: { email: voterEmail } });
  if (!voter)
    return NextResponse.json({ error: "Votant inconnu" }, { status: 400 });
  if (voter.votedAt)
    return NextResponse.json({ error: "Déjà voté" }, { status: 400 });

  const pseudo = hmacPseudo(`${voterEmail}|${electionId}`);

  // TODO: chiffrer pour de vrai (KMS/clé serveur)
  const payloadEnc = Buffer.from(JSON.stringify({ candidateId }), "utf8");

  await prisma.ballot.create({
    data: { electionId, candidateId, voterPseudo: pseudo, payloadEnc },
  });
  await prisma.voter.update({
    where: { email: voterEmail },
    data: { votedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
