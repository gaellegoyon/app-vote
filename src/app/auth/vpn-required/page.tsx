import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VpnRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-red-600">
            🔒 VPN Required
          </CardTitle>
          <CardDescription>Admin access unavailable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message principal */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Vous tentez d&apos;accéder à la partie admin{" "}
              <strong>sans connexion VPN/Bastion</strong>.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              ✅ Comment se connecter :
            </h3>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-mono text-gray-700">
                ssh -L 8443:localhost:443 user@bastion.rsx103.local
              </p>
              <p className="text-xs text-gray-600">
                (Remplacez{" "}
                <code className="bg-gray-200 px-1 rounded">user</code> et{" "}
                <code className="bg-gray-200 px-1 rounded">bastion</code>)
              </p>
            </div>

            <p className="text-sm text-gray-700">
              Puis accédez à : <strong>https://localhost:8443</strong>
            </p>
          </div>

          {/* Détails techniques */}
          <div className="border-t pt-4">
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                📋 Détails techniques
              </summary>
              <div className="mt-2 space-y-2 text-xs bg-gray-50 p-3 rounded">
                <p>
                  <strong>Service :</strong> Vote App Admin Panel
                </p>
                <p>
                  <strong>Méthode :</strong> Bastion (SSH tunnel + VPN)
                </p>
                <p>
                  <strong>Politique de sécurité :</strong> Zéro exposition
                  directe
                </p>
                <p>
                  <strong>Logs :</strong> Tous les accès sont enregistrés et
                  audités
                </p>
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>ESNA - Plateforme de vote sécurisée</p>
            <p>© 2025 RSX103 CNAM</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
