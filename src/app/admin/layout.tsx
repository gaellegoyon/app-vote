import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  FileText,
  Mail,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 min-h-[70vh]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invitations
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/candidates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Candidatures
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/elections" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Élections
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/results" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Résultats
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs sécurité
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1">{children}</div>
    </div>
  );
}
