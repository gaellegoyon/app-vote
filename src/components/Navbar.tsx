"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Vote, Users, Shield, Home, LogOut, Trophy } from "lucide-react";
import { useAdminAuth, useVoterAuth } from "@/lib/auth-client";
import { clearVoterSession, clearAdminSession } from "@/lib/cookies";
import { useState } from "react";

export default function Navbar() {
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { isVoter, loading: voterLoading } = useVoterAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleVoterLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Appeler l'API de déconnexion votant
      await fetch("/api/voter/logout", {
        method: "POST",
        credentials: "include",
      });

      // Supprimer également côté client pour être sûr
      clearVoterSession();

      // Rediriger vers l'accueil
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      // Appeler l'API de déconnexion admin
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      // Supprimer également côté client
      clearAdminSession();

      // Rediriger vers l'accueil
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur de déconnexion admin:", error);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
        <Link
          className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          href="/"
        >
          <Vote className="h-6 w-6" />
          <span>Vote Sécurisé</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Lien Accueil - toujours visible */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>

          {/* Navigation pour votants authentifiés - seulement si connecté ET pas admin */}
          {!voterLoading && isVoter && !isAdmin && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/candidates" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Candidater
                </Link>
              </Button>

              <Button variant="default" size="sm" asChild>
                <Link href="/vote" className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  Voter
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/results" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Résultats
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleVoterLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "..." : "Se déconnecter"}
              </Button>
            </>
          )}

          {/* Boutons de connexion pour utilisateurs non connectés */}
          {!voterLoading && !isVoter && !adminLoading && !isAdmin && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Connexion Votant
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </>
          )}

          {/* Lien Admin conditionnel - visible uniquement si authentifié admin */}
          {!adminLoading && isAdmin && (
            <>
              <Button variant="default" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Dashboard Admin
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion Admin
              </Button>
            </>
          )}

          <div className="ml-2 pl-2 border-l">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
