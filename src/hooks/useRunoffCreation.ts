import { useState } from "react";

export interface UseRunoffCreationProps {
  electionId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRunoffCreation({
  electionId,
  onSuccess,
  onError,
}: UseRunoffCreationProps) {
  const [isCreating, setIsCreating] = useState(false);

  const createRunoff = async (
    endpoint: string,
    payload: Record<string, unknown>
  ): Promise<void> => {
    setIsCreating(true);

    try {
      // Dates par défaut : commence dans 1 jour, se termine dans 3 jours
      const opensAt = new Date();
      opensAt.setDate(opensAt.getDate() + 1);

      const closesAt = new Date();
      closesAt.setDate(closesAt.getDate() + 3);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentElectionId: electionId,
          opensAt: opensAt.toISOString(),
          closesAt: closesAt.toISOString(),
          ...payload,
        }),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        const errorMessage =
          error.error || "Erreur lors de la création du second tour";
        if (onError) {
          onError(errorMessage);
        } else {
          alert(`Erreur: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création du second tour:", error);
      const errorMessage = "Erreur lors de la création du second tour";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createRunoff,
  };
}
