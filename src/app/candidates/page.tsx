"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Send, Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function CandidatesSubmit() {
  const [form, setForm] = useState({
    name: "",
    program: "",
    slogan: "",
  });
  const [ok, setOk] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/candidates/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setOk(res.ok ? "success" : "error");
    } catch {
      setOk("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium border border-primary/20">
          <Users className="mr-2 h-4 w-4 text-primary" />
          <span className="text-foreground">Candidature</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Déposer une candidature
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            Présentez-vous comme délégué de votre promotion. Partagez votre
            vision et votre programme avec vos camarades.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
            <CardHeader>
              <CardTitle className="text-2xl">
                Informations de candidature
              </CardTitle>
              <CardDescription className="text-base">
                Complétez le formulaire ci-dessous pour soumettre votre
                candidature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Jean Dupont"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="h-11 border-border/50 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program" className="text-base font-semibold">
                    Programme électoral{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="program"
                    placeholder="Décrivez votre programme, vos idées et propositions pour améliorer la vie étudiante..."
                    value={form.program}
                    onChange={(e) =>
                      setForm({ ...form, program: e.target.value })
                    }
                    rows={6}
                    required
                    className="border-border/50 bg-background/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan" className="text-base font-semibold">
                    Slogan de campagne
                  </Label>
                  <Input
                    id="slogan"
                    placeholder="Ex: Ensemble pour une promo unie !"
                    value={form.slogan}
                    onChange={(e) =>
                      setForm({ ...form, slogan: e.target.value })
                    }
                    className="h-11 border-border/50 bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optionnel — Un slogan accrocheur pour votre campagne
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Soumettre ma candidature
                    </>
                  )}
                </Button>
              </form>

              {ok && (
                <Alert
                  className={`mt-4 ${
                    ok === "success"
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-destructive/50 bg-destructive/5 dark:border-destructive/50"
                  }`}
                >
                  {ok === "success" ? (
                    <CheckCircle
                      className={`h-4 w-4 ${
                        ok === "success"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                    />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <AlertDescription
                    className={
                      ok === "success"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-destructive dark:text-destructive/90"
                    }
                  >
                    {ok === "success"
                      ? "✓ Candidature envoyée avec succès ! Elle est en attente de validation par l'administration."
                      : "✕ Une erreur s'est produite lors de l'envoi. Veuillez réessayer."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cette plateforme est protégée par un WAF et un système de
                limitation de débit pour garantir la sécurité des données.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Processus de validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-semibold text-primary">
                  1
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Soumission
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Envoi de votre candidature
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-semibold text-primary">
                  2
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Vérification
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Validation par l&apos;administration
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-semibold text-primary">
                  3
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Publication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Affichage sur la plateforme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
