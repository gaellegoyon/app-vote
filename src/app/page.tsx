import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Vote, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          🗳️ Élections ouvertes
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Élection des délégués
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          Participez à la démocratie étudiante ! Déposez votre candidature ou
          votez pour élire vos représentants au premier et second tour si
          nécessaire.
        </p>
      </section>

      {/* Action Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Candidature</CardTitle>
            </div>
            <CardDescription>
              Présentez-vous comme délégué de votre promotion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Soumettez votre candidature et présentez votre programme aux
              autres étudiants.
            </p>
            <Button asChild className="w-full">
              <Link href="/candidates">
                <Users className="mr-2 h-4 w-4" />
                Déposer ma candidature
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-primary" />
              <CardTitle>Vote</CardTitle>
            </div>
            <CardDescription>
              Exprimez votre choix pour les élections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Consultez les candidatures et votez pour vos représentants
              préférés.
            </p>
            <Button asChild variant="default" className="w-full">
              <Link href="/vote">
                <Vote className="mr-2 h-4 w-4" />
                Accéder au vote
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Process Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Processus électoral</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">1. Candidatures</h3>
            <p className="text-sm text-muted-foreground">
              Les étudiants déposent leur candidature
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">2. Premier tour</h3>
            <p className="text-sm text-muted-foreground">
              Vote pour élire les délégués
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">3. Résultats</h3>
            <p className="text-sm text-muted-foreground">
              Publication des résultats officiels
            </p>
          </div>
        </div>
      </section>

      {/* Status Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Statut des élections</p>
              <p className="text-sm text-muted-foreground">
                Les candidatures sont ouvertes. Le vote débutera bientôt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
