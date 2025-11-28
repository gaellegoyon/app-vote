import { ElectionResult } from "./types/election";

/**
 * Calcule les rangs des candidats en gérant les égalités
 */
export function calculateRanks(results: ElectionResult[]): void {
  let currentRank = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].votes !== results[i - 1].votes) {
      currentRank = i + 1;
    }
    results[i].rank = currentRank;
  }
}

/**
 * Calcule les pourcentages de votes
 */
export function calculatePercentages(
  results: ElectionResult[],
  totalVotes: number
): void {
  results.forEach((result) => {
    result.percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
  });
}

/**
 * Détermine les gagnants selon le nombre d'élus configuré
 */
export function determineWinners(
  results: ElectionResult[],
  numberOfElected: number
): ElectionResult[] {
  const winners: ElectionResult[] = [];

  if (results.length === 0) {
    return winners;
  }

  if (numberOfElected === 1) {
    // Élection uninominale : tous les candidats à égalité en première position
    const maxVotes = results[0].votes;
    winners.push(...results.filter((r) => r.votes === maxVotes));
  } else {
    // Élection plurinominale : les N premiers (avec gestion des égalités)
    let selectedCount = 0;

    for (
      let i = 0;
      i < results.length && selectedCount < numberOfElected;
      i++
    ) {
      const result = results[i];
      winners.push(result);
      selectedCount++;

      // Continuer si égalité avec le candidat suivant
      if (
        i + 1 < results.length &&
        results[i + 1].votes === result.votes &&
        selectedCount < numberOfElected
      ) {
        continue;
      }
    }
  }

  return winners;
}

/**
 * Détermine si un second tour est nécessaire et pourquoi
 */
export function determineRunoffNeed(
  winners: ElectionResult[],
  results: ElectionResult[],
  numberOfElected: number,
  totalVotes: number,
  hasAbsoluteMajority: boolean
): { needsRunoff: boolean; runoffReason: string | null } {
  if (numberOfElected === 1) {
    // Cas uninominal : second tour si pas de majorité absolue
    const needsRunoff =
      !hasAbsoluteMajority &&
      winners.length === 1 &&
      results.length >= 2 &&
      totalVotes > 0;

    return {
      needsRunoff,
      runoffReason: needsRunoff ? "Pas de majorité absolue" : null,
    };
  } else {
    // Cas plurinominal : égalité dépassant le nombre d'élus
    const hasExcessTie = winners.length > numberOfElected;
    const needsRunoff =
      hasExcessTie &&
      results.length >= 2 &&
      totalVotes > 0 &&
      winners.length <= numberOfElected + 2;

    return {
      needsRunoff,
      runoffReason: needsRunoff
        ? `Égalité dépassant le nombre d'élus (${winners.length} candidats pour ${numberOfElected} poste(s))`
        : null,
    };
  }
}

/**
 * Détermine les candidats pour le second tour
 */
export function determineRunoffCandidates(
  needsRunoff: boolean,
  winners: ElectionResult[],
  results: ElectionResult[],
  numberOfElected: number
): ElectionResult[] | undefined {
  if (!needsRunoff) {
    return undefined;
  }

  if (numberOfElected === 1) {
    // Cas uninominal : les 2 premiers si pas d'égalité en 2ème position
    const secondPlace = results.length > 1 ? results[1] : null;
    if (secondPlace) {
      const secondPlaceVotes = secondPlace.votes;
      const secondPlaceCandidates = results.filter(
        (r) => r.votes === secondPlaceVotes
      );

      if (secondPlaceCandidates.length === 1) {
        return [results[0], results[1]];
      }
    }
    return undefined;
  } else {
    // Cas plurinominal : tous les candidats à égalité
    return winners;
  }
}
