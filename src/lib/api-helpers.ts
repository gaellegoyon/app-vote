import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/security-node";

/**
 * Vérifie l'authentification admin pour les APIs
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<string | NextResponse> {
  const adminToken = request.cookies.get("admin_session")?.value;

  if (!adminToken) {
    return NextResponse.json(
      { error: "Authentification admin requise" },
      { status: 401 }
    );
  }

  try {
    await verifyToken(adminToken);
    return adminToken;
  } catch {
    return NextResponse.json(
      { error: "Session admin invalide" },
      { status: 401 }
    );
  }
}

/**
 * Gère les erreurs des APIs de manière uniforme
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  return NextResponse.json(
    { error: "Erreur interne du serveur" },
    { status: 500 }
  );
}

/**
 * Valide les paramètres requis
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  requiredFields: string[]
): NextResponse | null {
  const missingFields = requiredFields.filter((field) => !params[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: "Paramètres manquants ou invalides",
        missing: missingFields,
      },
      { status: 400 }
    );
  }

  return null;
}
