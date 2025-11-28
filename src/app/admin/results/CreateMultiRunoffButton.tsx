"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ElectionResult } from "@/lib/types/election";
import { useRunoffCreation } from "@/hooks/useRunoffCreation";

interface CreateMultiRunoffButtonProps {
  electionId: string;
  candidates: ElectionResult[];
  numberOfElected: number;
}

export default function CreateMultiRunoffButton({
  electionId,
  candidates,
  numberOfElected,
}: CreateMultiRunoffButtonProps) {
  const { isCreating, createRunoff } = useRunoffCreation({ electionId });

  const handleCreateRunoff = async () => {
    await createRunoff("/api/admin/create-multi-runoff", {
      candidateIds: candidates.map((c) => c.candidateId),
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <p className="font-medium mb-2">
          Second tour entre {candidates.length} candidats pour {numberOfElected}{" "}
          poste(s) :
        </p>
        <div className="flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <Badge
              key={candidate.candidateId}
              variant="outline"
              className="text-xs"
            >
              {candidate.candidate?.name} ({candidate.votes} voix)
            </Badge>
          ))}
        </div>
      </div>

      <Button
        onClick={handleCreateRunoff}
        disabled={isCreating}
        className="w-full"
      >
        <Users className="mr-2 h-4 w-4" />
        {isCreating ? "Création en cours..." : "Créer le second tour"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Le second tour démarrera automatiquement demain et durera 2 jours.
      </p>
    </div>
  );
}
