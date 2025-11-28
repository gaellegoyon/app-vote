import { prisma } from "@/lib/prisma";
import type { ElectionAnalysis } from "./types/election";
import {
  calculateRanks,
  calculatePercentages,
  determineWinners,
  determineRunoffNeed,
  determineRunoffCandidates,
} from "./election-analysis";

/**
 * Récupère les votes d'une élection depuis la base de données
 */
async function getElectionVotes(electionId: string) {
  return await prisma.$queryRaw<{ candidateid: string; count: bigint }[]>`
    SELECT b."candidateId" as candidateid, COUNT(*)::bigint 
    FROM "Ballot" b
    INNER JOIN "Candidate" c ON b."candidateId" = c.id 
    WHERE b."electionId" = ${electionId} AND c.validated = true AND c."electionId" = ${electionId}
    GROUP BY b."candidateId"
  `;
}

/**
 * Récupère les candidats validés d'une élection
 */
async function getElectionCandidates(electionId: string) {
  return await prisma.candidate.findMany({
    where: {
      validated: true,
      electionId: electionId,
    },
    select: {
      id: true,
      name: true,
      slogan: true,
    },
  });
}

/**
 * Analyse les résultats d'une élection
 */
export async function analyzeElectionResults(
  electionId: string
): Promise<ElectionAnalysis> {
  // Récupérer l'élection pour connaître le nombre d'élus
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    select: { numberOfElected: true },
  });

  if (!election) {
    throw new Error("Élection introuvable");
  }

  // Récupérer les données nécessaires
  const [counts, candidates] = await Promise.all([
    getElectionVotes(electionId),
    getElectionCandidates(electionId),
  ]);

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  // Construire les résultats
  const results = counts
    .map((r) => ({
      candidateId: r.candidateid,
      candidate: candidateMap.get(r.candidateid) || null,
      votes: Number(r.count),
      percentage: 0,
      rank: 0,
    }))
    .filter((r) => r.candidate)
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  // Calculer pourcentages et rangs
  calculatePercentages(results, totalVotes);
  calculateRanks(results);

  // Déterminer les gagnants
  const winners = determineWinners(results, election.numberOfElected);

  // Vérifier la majorité absolue (seulement pour numberOfElected = 1)
  const hasAbsoluteMajority =
    election.numberOfElected === 1 &&
    winners.length === 1 &&
    winners[0].percentage > 50;

  // Déterminer le besoin de second tour
  const { needsRunoff, runoffReason } = determineRunoffNeed(
    winners,
    results,
    election.numberOfElected,
    totalVotes,
    hasAbsoluteMajority
  );

  // Candidats pour le second tour
  const runoffCandidates = determineRunoffCandidates(
    needsRunoff,
    winners,
    results,
    election.numberOfElected
  );

  return {
    results,
    totalVotes,
    numberOfElected: election.numberOfElected,
    hasAbsoluteMajority,
    winners,
    needsRunoff: needsRunoff && !!runoffCandidates,
    runoffReason,
    runoffCandidates,
  };
}
