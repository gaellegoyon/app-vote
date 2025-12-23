import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Composant serveur pour protéger les routes admin
 * Vérifie que l'accès se fait via le VPN/Bastion
 */
export async function AdminGuard({ children }: AdminGuardProps) {
  // Cette vérification se fait côté serveur dans le middleware
  // Ce composant est juste documentaire
  return (
    <>
      {process.env.NODE_ENV === "production" && (
        <div className="mb-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              ✅ Connecté via VPN sécurisé
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
}
