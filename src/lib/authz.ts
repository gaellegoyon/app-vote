import { cookies } from "next/headers";
import { verifyToken } from "@/lib/security-node";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) throw new Error("unauth");
  const session = await verifyToken<{ email: string; role: string }>(token);
  if (session.role !== "admin") throw new Error("forbidden");
  return session;
}
