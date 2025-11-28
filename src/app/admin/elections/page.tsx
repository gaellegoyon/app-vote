import { prisma } from "@/lib/prisma";

// This admin page relies on database access; render it dynamically at request time
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Clock, Calendar, Lock } from "lucide-react";

export default async function AdminElections() {
  const elections = await prisma.election.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createRound1(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "Élection délégués – Tour 1");
    const numberOfElected = Number(formData.get("numberOfElected") || 1);
    const now = new Date();
    const closes = new Date(now.getTime() + 1000 * 60 * 60);
    await prisma.election.create({
      data: {
        title,
        round: 1,
        numberOfElected,
        opensAt: now,
        closesAt: closes,
      },
    });

    // Revalider la page pour mettre à jour les données
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/elections");

    // Rediriger pour s'assurer de l'actualisation
    const { redirect } = await import("next/navigation");
    redirect("/admin/elections");
  }

  async function closeElection(id: string) {
    "use server";
    const now = new Date();

    // Fermer l'élection en mettant à jour le closesAt
    await prisma.election.update({
      where: { id },
      data: { closesAt: now },
    });

    // Log de l'événement
    await prisma.eventLog.create({
      data: {
        type: "ELECTION_CLOSE",
        meta: { id, closedAt: now.toISOString() },
      },
    });

    // Rediriger pour mettre à jour l'affichage
    const { redirect } = await import("next/navigation");
    redirect("/admin/elections");
  }

  const isElectionActive = (election: { opensAt: Date; closesAt: Date }) => {
    const now = new Date();
    return now >= election.opensAt && now <= election.closesAt;
  };

  const getElectionStatus = (election: { opensAt: Date; closesAt: Date }) => {
    const now = new Date();
    if (now < election.opensAt)
      return { status: "À venir", variant: "secondary" as const };
    if (now > election.closesAt)
      return { status: "Fermée", variant: "outline" as const };
    return { status: "Ouverte", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des élections
        </h1>
        <p className="text-muted-foreground">
          Créez et gérez les tours d&apos;élection pour votre promotion.
        </p>
      </div>

      {/* Create Election */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer une nouvelle élection
          </CardTitle>
          <CardDescription>
            Lancez un nouveau tour d&apos;élection. Par défaut, l&apos;élection
            reste ouverte 1 heure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createRound1} className="space-y-4">
            <div className="flex gap-3">
              <Input
                name="title"
                placeholder="Titre de l'élection (optionnel)"
                className="flex-1"
              />
              <Input
                name="numberOfElected"
                type="number"
                min="1"
                max="20"
                defaultValue="1"
                placeholder="Nb élus"
                className="w-24"
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Créer et ouvrir
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Définissez le nombre de candidats qui seront élus à l&apos;issue
              de cette élection.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Elections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Élections ({elections.length})
          </CardTitle>
          <CardDescription>
            Liste de toutes les élections créées pour cette promotion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {elections.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucune élection</h3>
              <p className="text-muted-foreground">
                Créez votre première élection pour commencer le processus de
                vote.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((e: (typeof elections)[0]) => {
                const { status, variant } = getElectionStatus(e);
                return (
                  <Card key={e.id} className="transition-all hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{e.title}</span>
                            <Badge variant={variant}>{status}</Badge>
                            <Badge variant="outline">Tour {e.round}</Badge>
                            <Badge variant="secondary">
                              {e.numberOfElected} élu
                              {e.numberOfElected > 1 ? "s" : ""}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                Ouverture:{" "}
                                {new Date(e.opensAt).toLocaleString("fr-FR")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Lock className="h-3 w-3" />
                              <span>
                                Fermeture:{" "}
                                {new Date(e.closesAt).toLocaleString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isElectionActive(e) && (
                          <form action={closeElection.bind(null, e.id)}>
                            <Button variant="destructive" size="sm">
                              <Lock className="mr-2 h-4 w-4" />
                              Clôturer
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
