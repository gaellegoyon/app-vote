"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ElectionResult } from "@/lib/types/election";
import { useRunoffCreation } from "@/hooks/useRunoffCreation";

interface CreateRunoffButtonProps {
  electionId: string;
  candidate1: ElectionResult;
  candidate2: ElectionResult;
}

export default function CreateRunoffButton({
  electionId,
  candidate1,
  candidate2,
}: CreateRunoffButtonProps) {
  const { isCreating, createRunoff } = useRunoffCreation({ electionId });

  const handleCreateRunoff = async () => {
    await createRunoff("/api/admin/create-runoff", {
      candidate1Id: candidate1.candidateId,
      candidate2Id: candidate2.candidateId,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline">1er</Badge>
          <span className="font-medium">{candidate1.candidate?.name}</span>
          <span className="text-muted-foreground">
            ({candidate1.votes} voix)
          </span>
        </div>

        <span className="text-muted-foreground">vs</span>

        <div className="flex items-center gap-2">
          <Badge variant="outline">2e</Badge>
          <span className="font-medium">{candidate2.candidate?.name}</span>
          <span className="text-muted-foreground">
            ({candidate2.votes} voix)
          </span>
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
