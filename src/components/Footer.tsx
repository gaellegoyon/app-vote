import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-destructive fill-current" />
              <span>pour la démocratie</span>
            </div>
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} – Plateforme de vote sécurisée
            </p>
          </div>

          {/* Optional: Add divider and additional info */}
          <div className="w-12 h-px bg-border/30"></div>

          <p className="text-xs text-muted-foreground/60 text-center max-w-sm">
            RSX103 CNAM
          </p>
        </div>
      </div>
    </footer>
  );
}
