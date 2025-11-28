import { prisma } from "@/lib/prisma";
import type { Election, Candidate } from "@prisma/client";

type ParentElectionWithCandidates = Election & {
  candidates: Candidate[];
};

/**
 * Crée une élection de second tour avec plusieurs candidats
 */
export async function createMultiCandidateRunoffElection(
  parentElectionId: string,
  candidateIds: string[],
  opensAt: Date,
  closesAt: Date
): Promise<string> {
  const parentElection = await prisma.election.findUnique({
    where: { id: parentElectionId },
    include: { candidates: true },
  });

  if (!parentElection) {
    throw new Error("Élection parent introuvable");
  }

  const candidates = candidateIds
    .map((id) => parentElection.candidates.find((c) => c.id === id))
    .filter((candidate): candidate is Candidate => candidate !== undefined);

  if (candidates.length !== candidateIds.length) {
    throw new Error("Certains candidats sont introuvables");
  }

  return createRunoffElectionInternal(
    parentElection,
    candidates,
    opensAt,
    closesAt
  );
}

/**
 * Crée une élection de second tour (version classique à 2 candidats)
 */
export async function createRunoffElection(
  parentElectionId: string,
  candidate1Id: string,
  candidate2Id: string,
  opensAt: Date,
  closesAt: Date
): Promise<string> {
  const parentElection = await prisma.election.findUnique({
    where: { id: parentElectionId },
    include: { candidates: true },
  });

  if (!parentElection) {
    throw new Error("Élection parent introuvable");
  }

  const candidate1 = parentElection.candidates.find(
    (c) => c.id === candidate1Id
  );
  const candidate2 = parentElection.candidates.find(
    (c) => c.id === candidate2Id
  );

  if (!candidate1 || !candidate2) {
    throw new Error("Candidats introuvables");
  }

  return createRunoffElectionInternal(
    parentElection,
    [candidate1, candidate2],
    opensAt,
    closesAt
  );
}

/**
 * Logique commune pour créer une élection de second tour
 */
async function createRunoffElectionInternal(
  parentElection: ParentElectionWithCandidates,
  candidates: Candidate[],
  opensAt: Date,
  closesAt: Date
): Promise<string> {
  // Créer l'élection de second tour
  const runoffElection = await prisma.election.create({
    data: {
      title: `${parentElection.title} - Second tour`,
      round: parentElection.round + 1,
      numberOfElected: parentElection.numberOfElected,
      opensAt,
      closesAt,
      parentId: parentElection.id,
      status: "CREATED",
      candidates: {
        create: candidates.map((candidate) => ({
          name: candidate.name,
          slogan: candidate.slogan,
          program: candidate.program,
          validated: true,
        })),
      },
    },
  });

  // Copier les électeurs autorisés
  const parentVoters = await prisma.electionVoter.findMany({
    where: { electionId: parentElection.id },
  });

  await prisma.electionVoter.createMany({
    data: parentVoters.map((ev) => ({
      electionId: runoffElection.id,
      voterId: ev.voterId,
      invitedAt: new Date(),
    })),
  });

  // Marquer l'élection parent comme nécessitant un second tour
  await prisma.election.update({
    where: { id: parentElection.id },
    data: { status: "RUNOFF_REQUIRED" },
  });

  return runoffElection.id;
}
