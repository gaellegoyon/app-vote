import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trophy, Users, Vote } from "lucide-react";
import { ElectionAnalysis } from "@/lib/types/election";
import { ELECTION_STATUS } from "@/lib/constants/results";

interface ElectionStatsProps {
  analysis: ElectionAnalysis;
}

export default function ElectionStats({ analysis }: ElectionStatsProps) {
  const getElectionStatus = () => {
    if (analysis.hasAbsoluteMajority) return ELECTION_STATUS.ABSOLUTE_MAJORITY;
    if (analysis.needsRunoff) return ELECTION_STATUS.RUNOFF_REQUIRED;
    if (analysis.winners.length > 1) return ELECTION_STATUS.TIE;
    return ELECTION_STATUS.RELATIVE_MAJORITY;
  };

  const requiredMajority = Math.floor(analysis.totalVotes / 2) + 1;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des votes</CardTitle>
          <Vote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.totalVotes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Candidats</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.results.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Majorité requise
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{requiredMajority}</div>
          <p className="text-xs text-muted-foreground">voix (50% + 1)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Statut</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">{getElectionStatus()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
