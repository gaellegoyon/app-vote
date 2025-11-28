"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  adminEmail?: string;
}

export default function AdminHeader({ adminEmail }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      // Rediriger vers l'accueil après déconnexion
      router.push("/");

      // Optionnel : recharger la page pour nettoyer l'état
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="border-b bg-background">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold">Administration</h1>
            {adminEmail && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" />
                {adminEmail}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
        </Button>
      </div>
    </div>
  );
}
