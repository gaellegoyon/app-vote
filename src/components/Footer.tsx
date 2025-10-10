import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/10">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Fait avec</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>pour la démocratie étudiante</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} – Plateforme de vote ESNA
          </p>
        </div>
      </div>
    </footer>
  );
}
