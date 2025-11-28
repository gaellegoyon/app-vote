export interface ElectionResult {
  candidateId: string;
  candidate: {
    id: string;
    name: string;
    slogan?: string | null;
  } | null;
  votes: number;
  percentage: number;
  rank: number;
}

export interface ElectionAnalysis {
  results: ElectionResult[];
  totalVotes: number;
  numberOfElected: number;
  hasAbsoluteMajority: boolean;
  winners: ElectionResult[];
  needsRunoff: boolean;
  runoffReason: string | null;
  runoffCandidates: ElectionResult[] | undefined;
}
