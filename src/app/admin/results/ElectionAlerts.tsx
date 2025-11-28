import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertTriangle, Vote } from "lucide-react";
import { ElectionAnalysis } from "@/lib/types/election";
import CreateRunoffButton from "./CreateRunoffButton";
import CreateMultiRunoffButton from "./CreateMultiRunoffButton";

interface ElectionAlertsProps {
  analysis: ElectionAnalysis;
  electionId: string;
}

export default function ElectionAlerts({
  analysis,
  electionId,
}: ElectionAlertsProps) {
  const renderMultiElectedAlert = () => (
    <Alert className="border-blue-200 bg-blue-50">
      <Crown className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Élection à {analysis.numberOfElected} élus.</strong> Les{" "}
        {analysis.numberOfElected} candidats arrivés en tête seront élus.
      </AlertDescription>
    </Alert>
  );

  const renderTieAlert = () => (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Égalité détectée !</strong>{" "}
        {analysis.winners.length > analysis.numberOfElected
          ? `${analysis.winners.length} candidats sont éligibles pour ${analysis.numberOfElected} poste(s). Une procédure de départage pourrait être nécessaire.`
          : `${analysis.winners.length} candidats sont à égalité avec ${analysis.winners[0]?.votes} voix chacun. Une procédure de départage pourrait être nécessaire.`}
      </AlertDescription>
    </Alert>
  );

  const renderRunoffAlert = () => (
    <Alert className="border-blue-200 bg-blue-50">
      <Vote className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Second tour nécessaire !</strong>{" "}
        {analysis.runoffReason || "Conditions de second tour remplies"}.
        {analysis.runoffCandidates && analysis.runoffCandidates.length === 2 ? (
          <>
            {" "}
            Un second tour peut être organisé entre les deux candidats arrivés
            en tête.
            <div className="mt-3">
              <CreateRunoffButton
                electionId={electionId}
                candidate1={analysis.runoffCandidates[0]}
                candidate2={analysis.runoffCandidates[1]}
              />
            </div>
          </>
        ) : analysis.runoffCandidates ? (
          <>
            {" "}
            Un second tour doit être organisé entre les{" "}
            {analysis.runoffCandidates.length} candidats à égalité.
            <div className="mt-3">
              <CreateMultiRunoffButton
                electionId={electionId}
                candidates={analysis.runoffCandidates}
                numberOfElected={analysis.numberOfElected}
              />
            </div>
          </>
        ) : null}
      </AlertDescription>
    </Alert>
  );

  const renderAbsoluteMajorityAlert = () => (
    <Alert className="border-green-200 bg-green-50">
      <Crown className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Victoire au premier tour !</strong>{" "}
        {analysis.winners[0].candidate?.name} a obtenu la majorité absolue avec{" "}
        {analysis.winners[0].percentage.toFixed(1)}% des voix.
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-4">
      {/* Alerte pour élections multi-élus */}
      {analysis.numberOfElected > 1 && renderMultiElectedAlert()}

      {/* Alerte pour égalités */}
      {(analysis.winners.length > analysis.numberOfElected ||
        (analysis.numberOfElected === 1 && analysis.winners.length > 1)) &&
        renderTieAlert()}

      {/* Alerte pour second tour */}
      {analysis.needsRunoff && analysis.runoffCandidates && renderRunoffAlert()}

      {/* Alerte pour majorité absolue */}
      {analysis.hasAbsoluteMajority && renderAbsoluteMajorityAlert()}
    </div>
  );
}
