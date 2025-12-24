"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Users, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthChoicePage() {
  const [isViaBastion, setIsViaBastion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Vérifier si l'utilisateur accède via Bastion (127.0.0.1)
    // ou via le domaine public
    const checkAccessPath = async () => {
      try {
        const response = await fetch("/api/debug/ip");
        const data = await response.json();
        const ip = data.ip || "";

        // Si IP est via Bastion/VPN, afficher les options admin
        // IPs autorisées pour admin access:
        // - 127.0.0.1, ::1 = SSH tunnel local
        // - 10.0.0.14 = Bastion interne (DMZ)
        // - 192.168.10.50 = Bastion externe
        // - 10.10.0.x = VPN range
        const bastionIps = [
          "127.0.0.1",
          "::1",
          "10.0.0.14",
          "192.168.10.50",
          "10.10.0.2",
          "10.10.0.3",
          "10.10.0.4",
          "10.10.0.5",
        ];

        const isBastionAccess =
          ip === "" || bastionIps.includes(ip) || ip.startsWith("10.10.0."); // VPN range

        setIsViaBastion(isBastionAccess);
      } catch (err) {
        console.error("Could not determine access method:", err);
        setError("Erreur lors de la vérification d'accès");
      } finally {
        setLoading(false);
      }
    };

    checkAccessPath();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Subtle background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl dark:bg-primary/10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl dark:bg-accent/10"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-6">
            <span className="text-3xl">🗳️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
            Plateforme de Vote
          </h1>
          <p className="text-lg text-muted-foreground">RSX103 CNAM</p>
        </div>

        {/* Statut d'accès - SEULEMENT si via Bastion */}
        {isViaBastion && (
          <Alert className="mb-8 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
              ✓ Accès sécurisé via Bastion détecté. Les deux options de
              connexion sont disponibles.
            </AlertDescription>
          </Alert>
        )}

        {/* Choix de connexion */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option Votant - Toujours visible */}
          <Card className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer border border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Votant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Participez aux élections en tant que votant ou présentez votre
                candidature
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Voter aux élections</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Consulter les candidats</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Voir les résultats</span>
                </div>
              </div>
              <Link href="/auth/login" className="block pt-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Connexion Votant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Option Admin - COMPLÈTEMENT MASQUÉE si pas via Bastion */}
          {isViaBastion && (
            <Card className="group hover:shadow-xl hover:border-secondary/30 transition-all duration-300 cursor-pointer border border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-secondary/10 dark:bg-secondary/20 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30 transition-colors">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Administration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gérez les élections et consultez les résultats détaillés
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-secondary font-semibold">✓</span>
                    <span>Créer et gérer les élections</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-secondary font-semibold">✓</span>
                    <span>Inviter les votants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-secondary font-semibold">✓</span>
                    <span>Consulter les résultats</span>
                  </div>
                </div>
                <Link href="/auth/admin" className="block pt-2">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium">
                    Connexion Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Plateforme de vote © 2025 RSX103 CNAM</p>
        </div>
      </div>
    </div>
  );
}
