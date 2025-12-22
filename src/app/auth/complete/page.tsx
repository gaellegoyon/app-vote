"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, CheckCircle } from "lucide-react";

export default function AuthCompletePage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "form" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Read token from window location instead of next/navigation hook to avoid SSR prerender issues
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);

    if (!t) {
      setStatus("error");
      setMessage("Token d'invitation manquant");
      return;
    }

    // Vérifier la validité du token d'invitation
    fetch("/api/auth/complete", {
      method: "GET",
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setEmail(data.email);
          setTemporaryPassword(data.temporaryPassword);
          setStatus("form");
        } else {
          setStatus("error");
          setMessage(data.error || "Token d'invitation invalide");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erreur de vérification du token");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);
    const currentToken = token;

    try {
      const response = await fetch("/api/auth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: currentToken,
          temporaryPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setStatus("success");
        setMessage("Compte activé avec succès ! Redirection vers le vote...");
        setTimeout(() => {
          window.location.href = "/vote";
        }, 2000);
      } else {
        setMessage(data.error || "Erreur lors de l'activation");
      }
    } catch {
      setMessage("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-200">
            Vérification de votre invitation...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl dark:bg-slate-800/70 dark:border dark:border-slate-700/50">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invitation invalide
              </h1>
              <p className="text-gray-700 dark:text-gray-200">{message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Votre lien d&apos;invitation a peut-être expiré (15 min) ou a
                déjà été utilisé. Contactez l&apos;administrateur pour une
                nouvelle invitation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl dark:bg-slate-800/70 dark:border dark:border-slate-700/50">
          <CardContent className="pt-12">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bienvenue sur RSX103 Vote !
              </h1>
              <p className="text-gray-700 dark:text-gray-200">{message}</p>
              <div className="animate-pulse text-blue-600 dark:text-blue-400 font-medium">
                Redirection en cours...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/40 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.05),rgba(255,255,255,0.2))]"></div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        {" "}
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Activation du compte
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-200 mt-2">
              Configurez votre mot de passe pour accéder à RSX103 Vote
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="font-medium text-gray-700 dark:text-gray-100"
                >
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-75"
                />
              </div>

              {/* Temporary password field */}
              <div className="space-y-3">
                <Label
                  htmlFor="temporaryPassword"
                  className="font-medium text-gray-700 dark:text-gray-100"
                >
                  Mot de passe temporaire
                </Label>
                <div className="relative">
                  <Input
                    id="temporaryPassword"
                    type={showTempPassword ? "text" : "password"}
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    required
                    placeholder="Mot de passe reçu par email"
                    className="pr-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-300"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                  >
                    {showTempPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New password field */}
              <div className="space-y-3">
                <Label
                  htmlFor="newPassword"
                  className="font-medium text-gray-700 dark:text-gray-100"
                >
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 caractères"
                    className="pr-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-300"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm password field */}
              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="font-medium text-gray-700 dark:text-gray-100"
                >
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Répétez le nouveau mot de passe"
                    className="pr-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error/Success message */}
              {message && (
                <Alert
                  className={
                    message.includes("erreur") || message.includes("Erreur")
                      ? "border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 dark:text-red-100"
                      : "border-green-300 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 dark:text-green-100"
                  }
                >
                  <AlertDescription
                    className={
                      message.includes("erreur") || message.includes("Erreur")
                        ? "text-red-800 dark:text-red-100"
                        : "text-green-800 dark:text-green-100"
                    }
                  >
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-medium py-2 h-10 shadow-lg dark:shadow-lg dark:shadow-purple-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Activation en cours..." : "Activer le compte"}
              </Button>
            </form>

            {/* Footer info */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Après activation, vous pourrez voter et vous présenter comme
                candidat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
