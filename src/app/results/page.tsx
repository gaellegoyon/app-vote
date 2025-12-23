import { prisma } from "@/lib/prisma";

// Ensure this page is rendered dynamically at request-time instead of being prerendered
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Users, Vote, Clock, Lock } from "lucide-react";

export default async function PublicResultsPage() {
  // Récupérer l'élection la plus récente
  const election = await prisma.election.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!election) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium border border-primary/20">
            <Trophy className="mr-2 h-4 w-4 text-primary" />
            <span className="text-foreground">Résultats</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Résultats de l&apos;élection
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Consultez les résultats des élections des délégués.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/50 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
            <Vote className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucune élection disponible
          </h3>
          <p className="text-muted-foreground">
            Aucune élection n&apos;a été organisée pour le moment. Revenez plus
            tard.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isElectionClosed = now > election.closesAt;

  // Si l'élection n'est pas encore fermée
  if (!isElectionClosed) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium border border-primary/20">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span className="text-foreground">Élection en cours</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Résultats de l&apos;élection
            </h1>
            <p className="text-lg text-muted-foreground">{election.title}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-blue-50/20 dark:from-blue-950/30 dark:via-blue-950/20 dark:to-blue-950/10 p-6 text-blue-900 dark:text-blue-200">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold">Élection en cours de scrutin</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Les résultats seront disponibles après la fermeture de
                l&apos;élection le{" "}
                <span className="font-medium">
                  {new Date(election.closesAt).toLocaleString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // L'élection est fermée, afficher les résultats
  const counts = await prisma.$queryRaw<
    { candidateid: string; count: bigint }[]
  >`
    SELECT b."candidateId" as candidateid, COUNT(*)::bigint 
    FROM "Ballot" b
    INNER JOIN "Candidate" c ON b."candidateId" = c.id 
    WHERE b."electionId" = ${election.id} AND c.validated = true AND c."electionId" = ${election.id}
    GROUP BY b."candidateId"
  `;

  // Récupérer uniquement les candidats de cette élection
  const candidates = await prisma.candidate.findMany({
    where: {
      validated: true,
      electionId: election.id,
    },
  });
  const candMap = new Map(
    candidates.map((c: (typeof candidates)[0]) => [c.id, c])
  );

  // Trier les résultats par nombre de voix décroissant
  interface CountRow {
    candidateid: string;
    count: bigint;
  }

  type CandidateType = (typeof candidates)[0];

  interface ResultRow {
    candidate?: CandidateType | undefined;
    votes: number;
    candidateId: string;
  }

  interface SortedResult extends ResultRow {
    candidate: CandidateType;
  }

  type CandidateMap = Map<string, CandidateType>;

  const typedCandMap: CandidateMap = candMap as CandidateMap;

  type MapCallback = (r: CountRow) => ResultRow;
  type FilterPredicate = (r: ResultRow) => r is SortedResult;
  type SortComparator = (a: SortedResult, b: SortedResult) => number;

  const mapFn: MapCallback = (r) => ({
    candidate: typedCandMap.get(r.candidateid),
    votes: Number(r.count),
    candidateId: r.candidateid,
  });

  const filterFn: FilterPredicate = (r): r is SortedResult =>
    Boolean(r.candidate);

  const sortFn: SortComparator = (a, b) => b.votes - a.votes;

  const sortedResults: SortedResult[] = counts
    .map(mapFn)
    .filter(filterFn)
    .sort(sortFn);

  const totalVotes = sortedResults.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium border border-primary/20">
          <Lock className="mr-2 h-4 w-4 text-primary" />
          <span className="text-foreground">Élection clôturée</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Résultats de l&apos;élection
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            {election.title} — Résultats officiels
          </p>
        </div>
      </div>

      {/* Election Info */}
      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 via-emerald-50/30 to-emerald-50/20 dark:from-emerald-950/30 dark:via-emerald-950/20 dark:to-emerald-950/10 p-6 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-start gap-3">
          <Trophy className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold">Élection terminée avec succès</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
              Merci à tous les participants ! L&apos;élection s&apos;est
              clôturée le{" "}
              <span className="font-medium">
                {new Date(election.closesAt).toLocaleString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des votes
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Vote className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalVotes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              votes enregistrés
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidats
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {sortedResults.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">candidats</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participation
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalVotes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">votants</p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            Classement des candidats
          </CardTitle>
          <CardDescription className="text-base">
            Résultats officiels triés par nombre de voix obtenues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Vote className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Aucun vote enregistré
              </h3>
              <p className="text-muted-foreground mt-2">
                Aucun vote n&apos;a été enregistré pour cette élection.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedResults.map((result, index) => {
                const percentage =
                  totalVotes > 0
                    ? Math.round((result.votes / totalVotes) * 100)
                    : 0;
                const isWinner = index === 0 && result.votes > 0;

                return (
                  <div
                    key={`${result.candidateId}-${index}`}
                    className={`group p-4 rounded-xl border transition-all duration-200 ${
                      isWinner
                        ? "border-primary/50 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent"
                        : "border-border/30 bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm font-semibold ${
                            isWinner
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {result.candidate?.name}
                            </span>
                            {isWinner && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200">
                                <Trophy className="mr-1 h-3 w-3" />
                                Élu(e)
                              </Badge>
                            )}
                          </div>
                          {result.candidate?.slogan && (
                            <p className="text-sm text-muted-foreground mt-1">
                              &ldquo;{result.candidate.slogan}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-foreground">
                          {result.votes}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 w-full">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isWinner ? "bg-primary" : "bg-muted-foreground"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="border border-border/50 bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground text-center justify-center">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>
              Tous les votes ont été chiffrés et anonymisés pour garantir la
              confidentialité du scrutin.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
