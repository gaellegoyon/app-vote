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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Trophy, Users, Vote, Clock, Lock } from "lucide-react";

export default async function PublicResultsPage() {
  // Récupérer l'élection la plus récente
  const election = await prisma.election.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!election) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Résultats de l&apos;élection
          </h1>
          <p className="text-muted-foreground">
            Consultez les résultats de l&apos;élection des délégués.
          </p>
        </div>

        <Alert>
          <Vote className="h-4 w-4" />
          <AlertDescription>
            Aucune élection n&apos;a été organisée pour le moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const now = new Date();
  const isElectionClosed = now > election.closesAt;

  // Si l'élection n'est pas encore fermée
  if (!isElectionClosed) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Résultats de l&apos;élection
          </h1>
          <p className="text-muted-foreground">{election.title}</p>
        </div>

        <Alert className="border-blue-200 bg-blue-50 text-blue-800">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Élection en cours</strong> — Les résultats seront
            disponibles après la fermeture de l&apos;élection le{" "}
            {new Date(election.closesAt).toLocaleString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            .
          </AlertDescription>
        </Alert>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center rounded-lg bg-green-100 text-green-800 px-3 py-1 text-sm font-medium">
          <Lock className="mr-2 h-4 w-4" />
          Élection clôturée
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Résultats de l&apos;élection
        </h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          {election.title} — Résultats officiels
        </p>
      </div>

      {/* Election Info */}
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <Trophy className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Élection terminée</strong> — Merci à tous les participants !
          L&apos;élection s&apos;est clôturée le{" "}
          {new Date(election.closesAt).toLocaleString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          .
        </AlertDescription>
      </Alert>

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
            <CardTitle className="text-sm font-medium">Participation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes} votants</div>
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
            Résultats officiels triés par nombre de voix obtenues
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
                    key={`${result.candidateId}-${index}`}
                    className={`transition-all ${
                      isWinner ? "ring-2 ring-primary bg-primary/5" : ""
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
                                {result.candidate?.name}
                              </span>
                              {isWinner && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Trophy className="mr-1 h-3 w-3" />
                                  Élu(e)
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isWinner ? "bg-primary" : "bg-muted-foreground"
                            }`}
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

      {/* Footer Note */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <Lock className="inline h-4 w-4 mr-1" />
            Tous les votes ont été chiffrés et anonymisés pour garantir la
            confidentialité du scrutin.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
