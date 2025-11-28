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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <div className="text-center space-y-4">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          <Vote className="mr-2 h-4 w-4" />
          {election ? "Vote ouvert" : "Vote fermé"}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {election?.title ?? "Aucune élection ouverte"}
        </h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          {election
            ? "Consultez les candidatures et votez pour vos représentants préférés."
            : "Aucune élection n'est actuellement ouverte."}
        </p>
      </div>

      {/* Vote Status Alert */}
      <VoteStatusAlert />

      {!election ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune élection n&apos;est actuellement ouverte. Revenez plus tard
            pour participer au vote.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidats ({candidates.length})
            </CardTitle>
            <CardDescription>
              Candidats pour l&apos;élection: <strong>{election.title}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Aucun candidat</h3>
                <p className="text-muted-foreground">
                  Aucun candidat validé pour cette élection. Revenez plus tard.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
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
