import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Vote, Users, Shield, Home } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
        <Link
          className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          href="/"
        >
          <Vote className="h-6 w-6" />
          <span>Vote Promo</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Candidater
            </Link>
          </Button>

          <Button variant="default" size="sm" asChild>
            <Link href="/vote" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Voter
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </Button>

          <div className="ml-2 pl-2 border-l">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
