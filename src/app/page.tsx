"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/status");
        if (response.ok) {
          // Utilisateur admin connecté
          router.push("/admin");
          return;
        }
      } catch (_error) {
        console.log("Not admin");
      }

      // Vérifier si l'utilisateur est votant
      try {
        const response = await fetch("/api/voter/status");
        if (response.ok) {
          // Utilisateur votant connecté
          router.push("/vote");
          return;
        }
      } catch (_error) {
        console.log("Not voter");
      }

      // Vérifier si un token est présent dans l'URL (cas d'invitation)
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        // Rediriger vers la page de complétion du compte
        router.push(`/auth/complete?token=${token}`);
        return;
      }

      // Rediriger vers la page de login des votants par défaut
      router.push("/auth/login");
    };

    checkAdminStatus();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
