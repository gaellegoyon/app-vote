import { prisma } from "./prisma";
import { NextRequest } from "next/server";

export interface AuditLogData {
  email?: string;
  action: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  status?: "success" | "failure" | "error";
  details?: Record<string, unknown>;
}

/**
 * Extrait l'IP du client depuis la requête
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Log une action utilisateur pour l'audit
 */
export async function logAction(data: AuditLogData): Promise<void> {
  try {
    const createData: Record<string, unknown> = {
      email: data.email,
      action: data.action,
      resource: data.resource,
      ip: data.ip,
      userAgent: data.userAgent,
      status: data.status || "success",
    };

    if (data.details !== undefined) {
      createData.details = data.details;
    }

    await prisma.auditLog.create({
      data: createData as Parameters<typeof prisma.auditLog.create>[0]["data"],
    });
  } catch (error) {
    console.error("[AuditLog] Error logging action:", error);
    // Ne pas lever d'erreur pour ne pas affecter le workflow
  }
}

/**
 * Log une tentative de connexion admin
 */
export async function logAdminLogin(
  email: string,
  status: "success" | "failure",
  ip: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    email,
    action: "ADMIN_LOGIN",
    resource: "admin_auth",
    ip,
    status,
    details: {
      method: "LDAP",
      ...details,
    },
  });
}

/**
 * Log une tentative de connexion votant
 */
export async function logVoterLogin(
  email: string,
  status: "success" | "failure",
  ip: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    email,
    action: "VOTER_LOGIN",
    resource: "voter_auth",
    ip,
    status,
    ...(details && { details }),
  });
}

/**
 * Log un vote
 */
export async function logVote(
  email: string,
  electionId: string,
  ip: string
): Promise<void> {
  await logAction({
    email,
    action: "VOTE_CAST",
    resource: `election:${electionId}`,
    ip,
    status: "success",
  });
}

/**
 * Log une candidature
 */
export async function logCandidateSubmit(
  email: string,
  candidateName: string,
  electionId: string,
  ip: string
): Promise<void> {
  await logAction({
    email,
    action: "CANDIDATE_SUBMIT",
    resource: `election:${electionId}`,
    ip,
    status: "success",
    details: {
      candidateName,
    },
  });
}

/**
 * Log une action admin
 */
export async function logAdminAction(
  email: string,
  action: string,
  resource: string,
  ip: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    email,
    action,
    resource,
    ip,
    status: "success",
    ...(details && { details }),
  });
}
