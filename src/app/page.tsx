import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Mail, Users, Vote, Lock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          � Plateforme sécurisée
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Élections des délégués
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          Plateforme de vote sécurisée avec accès contrôlé par invitation
          uniquement. Seuls les électeurs invités peuvent participer au
          processus démocratique.
        </p>
      </section>

      {/* Accès contrôlé */}
      <section className="max-w-2xl mx-auto">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">
                Accès par invitation uniquement
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              Cette plateforme n&apos;est accessible qu&apos;aux électeurs
              préalablement invités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-orange-800">
              Pour participer aux élections, vous devez recevoir une invitation
              par email de la part de l&apos;administration. Cette invitation
              contient un lien sécurisé à usage unique valable 15 minutes.
            </p>
            <div className="bg-white p-3 rounded border border-orange-200">
              <p className="text-xs text-orange-700 font-medium">
                📧 Vérifiez votre boîte mail (y compris les spams) pour votre
                invitation
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Processus d'accès */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Processus d&apos;accès
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">1. Administration</h3>
            <p className="text-sm text-muted-foreground">
              L&apos;admin saisit les emails des électeurs éligibles
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">2. Invitation</h3>
            <p className="text-sm text-muted-foreground">
              Réception d&apos;un email avec lien sécurisé
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">3. Candidature</h3>
            <p className="text-sm text-muted-foreground">
              Possibilité de se présenter comme candidat
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Vote className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold">4. Vote</h3>
            <p className="text-sm text-muted-foreground">
              Participation au scrutin sécurisé
            </p>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-center">
          Sécurité & Confidentialité
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Bulletins chiffrés et anonymisés
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Liens d&apos;invitation à usage unique
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Audit trail complet des actions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Conformité RGPD</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accès */}
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Vote className="h-5 w-5" />
                Électeur invité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-700">
                Vous avez reçu une invitation et déjà activé votre compte ?
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Se connecter pour voter</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-5 w-5" />
                Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-purple-700">
                Espace réservé aux administrateurs pour gérer les élections
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">Accès administration</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Vous n&apos;avez pas reçu d&apos;invitation ?</strong>
            <br />
            Contactez l&apos;administration pour vérifier votre éligibilité au
            vote.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
