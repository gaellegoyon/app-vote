"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Users, Send, AlertCircle, CheckCircle } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

export default function AdminInvitePage() {
  const [emails, setEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeElection, setActiveElection] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Récupérer l'élection active au chargement
  useEffect(() => {
    fetch("/api/admin/active-election")
      .then((res) => res.json())
      .then((data) => {
        if (data.election) {
          setActiveElection(data.election);
        }
      })
      .catch(console.error);
  }, []);

  const handleSendInvites = async () => {
    if (!emails.trim()) {
      setResult({
        type: "error",
        message: "Veuillez saisir au moins une adresse email",
      });
      return;
    }

    if (!activeElection) {
      setResult({
        type: "error",
        message: "Aucune élection active trouvée. Créez d'abord une élection.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Parser les emails (séparés par virgules ou retours à la ligne)
      const emailList = emails
        .split(/[,\n]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .filter((email) => email.includes("@"));

      if (emailList.length === 0) {
        setResult({
          type: "error",
          message: "Aucune adresse email valide trouvée",
        });
        return;
      }

      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailList,
          electionId: activeElection.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: "success",
          message: `${data.sent} invitation(s) envoyée(s) avec succès pour l'élection "${activeElection.title}"`,
        });
        setEmails(""); // Vider le champ après succès
      } else {
        setResult({
          type: "error",
          message: data.error || "Erreur lors de l'envoi",
        });
      }
    } catch {
      setResult({ type: "error", message: "Erreur de connexion" });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleEmails = `etudiant1@esna.fr
etudiant2@esna.fr
etudiant3@esna.fr`;

  return (
    <div>
      <AdminHeader />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            <Mail className="mr-2 h-4 w-4" />
            Gestion des invitations
          </div>
          <h1 className="text-3xl font-bold">Inviter les électeurs</h1>
          {activeElection ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-green-800">
                <strong>Élection active :</strong> {activeElection.title}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Les invitations seront automatiquement liées à cette élection
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-orange-800">
                <strong>Aucune élection active</strong>
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Créez d&apos;abord une élection avant d&apos;envoyer des
                invitations
              </p>
            </div>
          )}
          <p className="text-gray-600 max-w-2xl mx-auto">
            Saisissez les adresses email des électeurs éligibles. Chaque
            électeur recevra un email avec un mot de passe temporaire et un lien
            d&apos;activation valable 15 minutes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulaire d'invitation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invitations en masse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresses email (une par ligne ou séparées par des virgules)
                </label>
                <Textarea
                  placeholder={exampleEmails}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={8}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleSendInvites}
                disabled={isLoading || !emails.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer les invitations
                  </>
                )}
              </Button>

              {result && (
                <div
                  className={`p-3 rounded-lg border ${
                    result.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {result.message}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Informations importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">🔒 Sécurité</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Liens à usage unique (impossible de les réutiliser)</li>
                  <li>• Expiration automatique après 15 minutes</li>
                  <li>• Chiffrement des données de vote</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">📧 Format des emails</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Une adresse par ligne</li>
                  <li>• Ou séparées par des virgules</li>
                  <li>• Validation automatique du format</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">⚡ Processus</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Email avec mot de passe temporaire</li>
                  <li>• Activation du compte via lien sécurisé</li>
                  <li>• Choix d&apos;un nouveau mot de passe</li>
                  <li>• Accès au vote et candidature</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 <strong>Conseil :</strong> Préparez la liste d&apos;emails
                  à l&apos;avance et envoyez toutes les invitations en une fois
                  pour synchroniser l&apos;ouverture du vote.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
