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
      <div className="text-center space-y-4">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          <Users className="mr-2 h-4 w-4" />
          Candidature
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Déposer une candidature
        </h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Présentez-vous comme délégué de votre promotion. Partagez votre vision
          et votre programme avec vos camarades.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de candidature</CardTitle>
              <CardDescription>
                Complétez le formulaire ci-dessous pour soumettre votre
                candidature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Jean Dupont"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Programme électoral *</Label>
                  <Textarea
                    id="program"
                    placeholder="Décrivez votre programme, vos idées et propositions pour améliorer la vie étudiante..."
                    value={form.program}
                    onChange={(e) =>
                      setForm({ ...form, program: e.target.value })
                    }
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan de campagne</Label>
                  <Input
                    id="slogan"
                    placeholder="Ex: Ensemble pour une promo unie !"
                    value={form.slogan}
                    onChange={(e) =>
                      setForm({ ...form, slogan: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Optionnel - Un slogan accrocheur pour votre campagne
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
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
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  {ok === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      ok === "success" ? "text-green-800" : "text-red-800"
                    }
                  >
                    {ok === "success"
                      ? "Candidature envoyée avec succès ! Elle est en attente de validation par l'administration."
                      : "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cette plateforme est protégée par un WAF et un système de
                limitation de débit pour garantir la sécurité des données.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processus de validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Soumission</p>
                  <p className="text-xs text-muted-foreground">
                    Envoi de votre candidature
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Vérification</p>
                  <p className="text-xs text-muted-foreground">
                    Validation par l&apos;administration
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Publication</p>
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
