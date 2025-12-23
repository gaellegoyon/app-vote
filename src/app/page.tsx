"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (admin ou votant)
    const checkExistingSession = async () => {
      try {
        // Vérifier si l'utilisateur est admin
        const adminResponse = await fetch("/api/admin/status");
        if (adminResponse.ok) {
          router.push("/admin");
          return;
        }
      } catch (_error) {
        // Pas admin, continuer
      }

      try {
        // Vérifier si l'utilisateur est votant
        const voterResponse = await fetch("/api/voter/status");
        if (voterResponse.ok) {
          router.push("/vote");
          return;
        }
      } catch (_error) {
        // Pas votant, continuer
      }

      // Vérifier si un token est présent dans l'URL (cas d'invitation)
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        router.push(`/auth/complete?token=${token}`);
        return;
      }

      // Rediriger vers la page de choix d'authentification
      router.push("/auth");
    };

    checkExistingSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
