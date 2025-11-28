import { cookies } from "next/headers";
import { verifyToken } from "@/lib/security-node";

// Vérification côté serveur pour les composants React Server Components
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) return false;

    const session = await verifyToken<{ email: string; role: string }>(token);
    return session.role === "admin";
  } catch {
    return false;
  }
}

// Récupérer les infos de session admin (côté serveur)
export async function getAdminSession(): Promise<{
  email: string;
  role: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) return null;

    return await verifyToken<{ email: string; role: string }>(token);
  } catch {
    return null;
  }
}
