import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Users, Vote } from "lucide-react";

export default async function ResultsPage() {
  const e = await prisma.election.findFirst({
    where: { round: 1 },
    orderBy: { createdAt: "desc" },
  });

  if (!e) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Résultats des élections
          </h1>
          <p className="text-muted-foreground">
            Consultez les résultats détaillés des votes.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Vote className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucune élection</h3>
              <p className="text-muted-foreground">
                Aucune élection n&apos;a été créée pour le moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = await prisma.$queryRaw<
    { candidateid: string; count: bigint }[]
  >`SELECT "candidateId", COUNT(*)::bigint FROM "Ballot" WHERE "electionId" = ${e.id} GROUP BY "candidateId"`;

  const candidates = await prisma.candidate.findMany();
  const candMap = new Map(candidates.map((c) => [c.id, c]));

  // Trier les résultats par nombre de voix décroissant
  const sortedResults = counts
    .map((r) => ({
      candidate: candMap.get(r.candidateid),
      votes: Number(r.count),
      candidateId: r.candidateid,
    }))
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = sortedResults.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Résultats des élections
        </h1>
        <p className="text-muted-foreground">
          Résultats détaillés pour {e.title}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des votes
            </CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de participation
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVotes > 0
                ? Math.round((totalVotes / candidates.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Classement des candidats
          </CardTitle>
          <CardDescription>
            Résultats triés par nombre de voix obtenues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedResults.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucun vote</h3>
              <p className="text-muted-foreground">
                Aucun vote n&apos;a été enregistré pour cette élection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedResults.map((result, index) => {
                const percentage =
                  totalVotes > 0
                    ? Math.round((result.votes / totalVotes) * 100)
                    : 0;
                const isWinner = index === 0 && result.votes > 0;

                return (
                  <Card
                    key={result.candidateId}
                    className={`transition-all ${
                      isWinner ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                              isWinner
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {result.candidate?.name ||
                                  `Candidat ${result.candidateId}`}
                              </span>
                              {isWinner && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Trophy className="mr-1 h-3 w-3" />
                                  Gagnant
                                </Badge>
                              )}
                            </div>
                            {result.candidate?.slogan && (
                              <p className="text-sm text-muted-foreground">
                                {result.candidate.slogan}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {result.votes}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {percentage}% des voix
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
