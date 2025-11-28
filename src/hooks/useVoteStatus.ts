"use client";

import { useEffect, useState } from "react";

interface VoteStatus {
  hasVoted: boolean;
  votedAt: string | null;
  voteInfo: {
    votedAt: string;
    message: string;
  } | null;
}

export function useVoteStatus() {
  const [status, setStatus] = useState<VoteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/voter/vote-status");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        } else {
          setError("Erreur lors de la récupération du statut");
        }
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  return { status, loading, error };
}
