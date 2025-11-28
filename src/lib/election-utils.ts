import { prisma } from "@/lib/prisma";

/**
 * Récupère l'élection active (ouverte) ou la plus récente
 */
export async function getActiveElection() {
  const now = new Date();

  // Chercher d'abord une élection ouverte
  const activeElection = await prisma.election.findFirst({
    where: {
      opensAt: { lte: now },
      closesAt: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeElection) {
    return activeElection;
  }

  // Si aucune élection ouverte, prendre la plus récente
  const latestElection = await prisma.election.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return latestElection;
}

/**
 * Récupère l'élection active (ouverte seulement)
 */
export async function getOpenElection() {
  const now = new Date();

  return await prisma.election.findFirst({
    where: {
      opensAt: { lte: now },
      closesAt: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });
}
