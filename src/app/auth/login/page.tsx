"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Vote, Shield } from "lucide-react";
import Link from "next/link";

export default function VoterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.ok) {
        window.location.href = "/vote";
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Vote className="h-8 w-8 text-blue-500 mr-2" />
            <CardTitle className="text-2xl">Connexion électeur</CardTitle>
          </div>
          <p className="text-gray-600">
            Connectez-vous pour accéder au vote RSX103
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@esna.fr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="Votre mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Vous n&apos;avez pas encore reçu d&apos;invitation ?
              </p>
              <p className="text-xs text-gray-500">
                Contactez l&apos;administration pour recevoir votre lien
                d&apos;invitation sécurisé.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            Connexion sécurisée RSX103
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
