import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import CandidateCard from "@/components/CandidateCard";
import VoteButton from "@/components/VoteButton";
import VoteStatusAlert from "@/components/VoteStatusAlert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Vote, Users, AlertCircle } from "lucide-react";
import { getOpenElection } from "@/lib/election-utils";

export default async function VotePage() {
  // Récupérer l'élection actuellement ouverte
  const election = await getOpenElection();

  // Récupérer les candidats validés pour cette élection uniquement
  const candidates = election
    ? await prisma.candidate.findMany({
        where: {
          validated: true,
          electionId: election.id,
        },
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium border border-primary/20">
          <Vote className="mr-2 h-4 w-4 text-primary" />
          <span className="text-foreground">
            {election ? "Vote ouvert" : "Vote fermé"}
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {election?.title ?? "Aucune élection ouverte"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            {election
              ? "Consultez les candidatures et votez pour vos représentants préférés."
              : "Aucune élection n'est actuellement ouverte. Revenez plus tard pour participer."}
          </p>
        </div>
      </div>

      {/* Vote Status Alert */}
      <VoteStatusAlert />

      {!election ? (
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/50 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucune élection disponible
          </h3>
          <p className="text-muted-foreground">
            Revenez plus tard pour participer au vote.
          </p>
        </div>
      ) : (
        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Candidats ({candidates.length})
            </CardTitle>
            <CardDescription className="text-base">
              Candidats pour l&apos;élection:{" "}
              <span className="font-semibold text-foreground">
                {election.title}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Aucun candidat validé
                </h3>
                <p className="text-muted-foreground mt-2">
                  Les candidatures sont actuellement en attente de validation.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {candidates.map((c: (typeof candidates)[0]) => (
                  <CandidateCard
                    key={c.id}
                    name={c.name}
                    slogan={c.slogan}
                    program={c.program}
                    rightSlot={
                      <VoteButton electionId={election.id} candidateId={c.id} />
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
