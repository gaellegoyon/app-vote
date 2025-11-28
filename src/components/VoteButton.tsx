"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Vote, Check, X, CheckCircle } from "lucide-react";
import { useVoteStatus } from "@/hooks/useVoteStatus";

export default function VoteButton({
  candidateId,
  electionId,
}: {
  candidateId: string;
  electionId: string;
}) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { status: voteStatus, loading: statusLoading } = useVoteStatus();

  async function cast() {
    setStatus("idle");
    const r = await fetch("/api/vote/ballot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ electionId, candidateId }),
    });

    setStatus(r.ok ? "success" : "error");

    // Reset status after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  }

  // Si le votant a déjà voté, afficher un état différent
  if (!statusLoading && voteStatus?.hasVoted) {
    return (
      <Button
        disabled
        variant="outline"
        size="sm"
        className="min-w-[100px] text-green-600 border-green-600"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Déjà voté
      </Button>
    );
  }

  const getButtonContent = () => {
    if (pending) {
      return (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Envoi...
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Voté !
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <X className="mr-2 h-4 w-4" />
          Erreur
        </>
      );
    }

    return (
      <>
        <Vote className="mr-2 h-4 w-4" />
        Voter
      </>
    );
  };

  const getButtonVariant = () => {
    if (status === "success") return "default";
    if (status === "error") return "destructive";
    return "default";
  };

  return (
    <Button
      disabled={pending || status === "success" || statusLoading}
      onClick={() => start(cast)}
      variant={getButtonVariant()}
      size="sm"
      className="min-w-[100px]"
    >
      {getButtonContent()}
    </Button>
  );
}
