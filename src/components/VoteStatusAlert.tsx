"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock } from "lucide-react";
import { useVoteStatus } from "@/hooks/useVoteStatus";

export default function VoteStatusAlert() {
  const { status, loading, error } = useVoteStatus();

  if (loading || error || !status) {
    return null;
  }

  if (status.hasVoted) {
    const votedDate = new Date(status.votedAt!).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Vote enregistré ✓</strong> — Vous avez déjà participé à cette
          élection le {votedDate}. Votre vote a été pris en compte de manière
          anonyme et sécurisée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800">
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <strong>Vote ouvert</strong> — Vous pouvez voter pour le candidat de
        votre choix. Votre vote sera anonyme et chiffré.
      </AlertDescription>
    </Alert>
  );
}
