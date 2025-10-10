import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Vote, UserCheck, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const [cands, voters, ballots, elections] = await Promise.all([
    prisma.candidate.count(),
    prisma.voter.count(),
    prisma.ballot.count(),
    prisma.election.count(),
  ]);

  const stats = [
    {
      title: "Candidats",
      value: cands,
      description: "Candidatures soumises",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Votants inscrits",
      value: voters,
      description: "Électeurs enregistrés",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Votes exprimés",
      value: ballots,
      description: "Bulletins déposés",
      icon: Vote,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Élections",
      value: elections,
      description: "Tours organisés",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const participationRate =
    voters > 0 ? Math.round((ballots / voters) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          <Shield className="mr-2 h-4 w-4" />
          Administration
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Vue d&apos;ensemble des statistiques et de l&apos;activité de la
          plateforme de vote.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Participation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Taux de participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{participationRate}%</div>
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(participationRate, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {ballots} votes sur {voters} électeurs inscrits
              </p>
            </div>
            <Badge variant={participationRate >= 50 ? "default" : "secondary"}>
              {participationRate >= 50 ? "Bon" : "Faible"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 font-medium">Candidats</h3>
                <p className="text-sm text-muted-foreground">
                  Gérer les candidatures
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Vote className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 font-medium">Élections</h3>
                <p className="text-sm text-muted-foreground">
                  Configurer les tours
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 font-medium">Résultats</h3>
                <p className="text-sm text-muted-foreground">
                  Analyser les votes
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
