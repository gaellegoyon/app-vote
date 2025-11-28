"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Clock, User } from "lucide-react";

export type Candidate = {
  id: string;
  name: string;
  slogan?: string | null;
  program?: string | null;
  validated: boolean;
  createdAt: string;
};

export default function AdminCandidatesClient({
  initialCandidates,
  electionTitle,
}: {
  initialCandidates: Candidate[];
  electionTitle?: string;
}) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [loading, setLoading] = useState<{ [id: string]: boolean }>({});

  const pendingCount = candidates.filter((c) => !c.validated).length;
  const validatedCount = candidates.filter((c) => c.validated).length;

  async function handleValidate(id: string) {
    setLoading((l) => ({ ...l, [id]: true }));
    try {
      const res = await fetch("/api/admin/validate-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, validated: true } : c))
        );
      }
    } finally {
      setLoading((l) => ({ ...l, [id]: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validées</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validatedCount}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {electionTitle
              ? `${electionTitle} — Liste des candidatures`
              : "Liste des candidatures"}
          </CardTitle>
          <CardDescription>
            Cliquez sur &quot;Valider&quot; pour approuver une candidature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucune candidature</h3>
              <p className="text-muted-foreground">
                Aucune candidature n&apos;a été soumise pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((c) => (
                <Card key={c.id} className="transition-all hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{c.name}</span>
                          <Badge
                            className={
                              c.validated
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-orange-100 text-orange-800 border-orange-300"
                            }
                          >
                            {c.validated ? "Validé" : "En attente"}
                          </Badge>
                        </div>
                        {c.slogan && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Slogan:</strong> {c.slogan}
                          </p>
                        )}
                        {c.program && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Programme:</strong>{" "}
                            {c.program.length > 100
                              ? `${c.program.substring(0, 100)}...`
                              : c.program}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Soumise le{" "}
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {!c.validated && (
                        <Button
                          size="sm"
                          className="ml-4"
                          onClick={() => handleValidate(c.id)}
                          disabled={loading[c.id]}
                        >
                          {loading[c.id] ? (
                            <span className="flex items-center">
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              Validation...
                            </span>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Valider
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
