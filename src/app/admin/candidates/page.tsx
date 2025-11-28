import { prisma } from "@/lib/prisma";

// This admin page needs live DB access; force dynamic rendering to avoid build-time DB calls
export const dynamic = "force-dynamic";
import { getActiveElection } from "@/lib/election-utils";
import AdminCandidatesClient from "./AdminCandidatesClient";

export default async function AdminCandidates() {
  const activeElection = await getActiveElection();
  if (!activeElection) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des candidatures
          </h1>
          <p className="text-muted-foreground">
            Aucune élection disponible pour gérer les candidatures.
          </p>
        </div>
      </div>
    );
  }
  const list = await prisma.candidate.findMany({
    where: { electionId: activeElection.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des candidatures
        </h1>
        <p className="text-muted-foreground">
          Candidatures pour l&apos;élection:{" "}
          <strong>{activeElection.title}</strong>
        </p>
      </div>
      <AdminCandidatesClient
        initialCandidates={list.map((c: (typeof list)[0]) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
        electionTitle={activeElection.title}
      />
    </div>
  );
}
