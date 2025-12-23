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

        // Si IP est 127.0.0.1 ou localhost, c'est via Bastion/tunnel
        const isBastionAccess =
          ip.includes("127.0.0.1") ||
          ip.includes("::1") ||
          ip === "" ||
          ip === "127.0.0.1";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/40 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            🗳️ Plateforme de Vote
          </h1>
          <p className="text-gray-600 dark:text-gray-400">RSX103 CNAM</p>
        </div>

        {/* Statut d'accès - SEULEMENT si via Bastion */}
        {isViaBastion && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Accès sécurisé via Bastion détecté. Les deux options de
              connexion sont disponibles.
            </AlertDescription>
          </Alert>
        )}

        {/* Choix de connexion */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option Votant - Toujours visible */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Votant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Je participe aux élections en tant que votant ou candidat
              </p>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>✓ Voter aux élections</li>
                <li>✓ Consulter les candidats</li>
                <li>✓ Voir les résultats</li>
              </ul>
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Connexion Votant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Option Admin - COMPLÈTEMENT MASQUÉE si pas via Bastion */}
          {isViaBastion && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Administration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérer les élections et consulter les résultats
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>✓ Créer et gérer les élections</li>
                  <li>✓ Inviter les votants</li>
                  <li>✓ Consulter les résultats</li>
                </ul>
                <Link href="/auth/admin" className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Connexion Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Plateforme de vote © 2025 RSX103 CNAM</p>
        </div>
      </div>
    </div>
  );
}
