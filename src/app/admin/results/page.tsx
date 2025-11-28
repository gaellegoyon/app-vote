import { prisma } from "@/lib/prisma";
import { analyzeElectionResults } from "@/lib/election-results";

export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Vote } from "lucide-react";
import ElectionAlerts from "./ElectionAlerts";
import ElectionStats from "./ElectionStats";
import { CANDIDATE_BADGES } from "@/lib/constants/results";

export default async function ResultsPage() {
  // Récupérer l'élection la plus récente
  const election = await prisma.election.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      parent: true,
      childElections: true,
    },
  });

  if (!election) {
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

  const analysis = await analyzeElectionResults(election.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Résultats des élections
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-muted-foreground">
            Résultats détaillés pour {election.title}
          </p>
          {election.round > 1 && (
            <Badge variant="outline">Tour {election.round}</Badge>
          )}
        </div>
      </div>

      {/* Election Status Alerts */}
      <ElectionAlerts analysis={analysis} electionId={election.id} />

      {/* Stats Overview */}
      <ElectionStats analysis={analysis} />

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Classement des candidats
          </CardTitle>
          <CardDescription>
            Résultats triés par nombre de voix obtenues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.results.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucun vote</h3>
              <p className="text-muted-foreground">
                Aucun vote n&apos;a été enregistré pour cette élection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.results.map((result, index) => {
                const isWinner = analysis.winners.some(
                  (w) => w.candidateId === result.candidateId
                );
                const isRunoffCandidate = analysis.runoffCandidates?.some(
                  (r) => r.candidateId === result.candidateId
                );

                return (
                  <Card
                    key={`${result.candidateId}-${index}`}
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
                            {result.rank}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {result.candidate?.name || "Candidat supprimé"}
                              </span>

                              {isWinner &&
                                (analysis.hasAbsoluteMajority ||
                                  analysis.numberOfElected > 1) && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Crown className="mr-1 h-3 w-3" />
                                    {CANDIDATE_BADGES.ELECTED}
                                  </Badge>
                                )}

                              {isWinner &&
                                !analysis.hasAbsoluteMajority &&
                                analysis.numberOfElected === 1 &&
                                analysis.winners.length === 1 && (
                                  <Badge variant="outline">
                                    {CANDIDATE_BADGES.LEADING}
                                  </Badge>
                                )}

                              {isWinner &&
                                analysis.winners.length > 1 &&
                                analysis.numberOfElected === 1 && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                    {CANDIDATE_BADGES.TIED}
                                  </Badge>
                                )}

                              {isRunoffCandidate && analysis.needsRunoff && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  {CANDIDATE_BADGES.QUALIFIED_RUNOFF}
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
                            {result.percentage.toFixed(1)}% des voix
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isWinner ? "bg-primary" : "bg-muted-foreground/50"
                            }`}
                            style={{ width: `${result.percentage}%` }}
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

      {/* Election History */}
      {(election.parent || election.childElections.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des tours</CardTitle>
            <CardDescription>
              Suivi des différents tours de cette élection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {election.parent && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Tour précédent:</strong> {election.parent.title}
                  </p>
                </div>
              )}

              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>Tour actuel:</strong> {election.title} (Tour{" "}
                  {election.round})
                </p>
              </div>

              {election.childElections.map(
                (child: (typeof election.childElections)[0]) => (
                  <div key={child.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Tour suivant:</strong> {child.title}
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
