import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/security-edge";

function ipFrom(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function allowed(ip: string) {
  // ✅ IPs VPN/Bastion autorisées UNIQUEMENT
  const allowedIps = [
    "10.10.0.2",
    "10.10.0.3",
    "10.10.0.4",
    "10.10.0.5",
    // Bastion SSH (interne)
    "10.0.0.14",
    "192.168.10.50",
    // Pour le bastion SSH tunnel
    "127.0.0.1",
    "::1",
  ];

  if (process.env.NODE_ENV === "development") {
    return ip.includes("127.0.0.1") || ip.includes("::1") || ip === "";
  }

  // Mode production : strict, IPs whitelist uniquement
  return allowedIps.includes(ip);
}
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pages publiques autorisées
  const publicPages = [
    "/",
    "/favicon.ico",
    "/auth", // Page de choix d'authentification
    "/auth/complete", // Pour les liens d'invitation
    "/auth/login", // Pour la connexion des électeurs
    "/auth/vpn-required", // Page VPN info
    "/_next", // Assets Next.js
    "/api/auth/complete", // API pour compléter les invitations
    "/api/auth/login", // API pour la connexion des électeurs
    "/api/debug/ip", // Pour détecter le type d'accès
  ];

  // En développement, ajouter les pages admin à la liste publique
  if (process.env.NODE_ENV === "development") {
    publicPages.push("/auth/admin", "/api/auth/admin");
  }

  // Vérifier si c'est une page publique
  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  // Routes admin (VPN requis)
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/auth/admin");

  // Routes votants (session voter requise)
  const isVoterRoute =
    pathname.startsWith("/candidates") ||
    pathname.startsWith("/vote") ||
    pathname.startsWith("/results") ||
    pathname.startsWith("/api/candidates") ||
    pathname.startsWith("/api/vote");

  // 1. Protection VPN pour routes admin (STRICT en production)
  if (isAdminRoute && process.env.NODE_ENV === "production") {
    const ip = ipFrom(request);
    if (!allowed(ip)) {
      console.warn(`[SECURITY] Admin access blocked from IP: ${ip}`);
      // Rediriger vers page d'explication au lieu de retourner 403
      return NextResponse.redirect(new URL("/auth/vpn-required", request.url));
    }
  }

  // 2. Protection JWT pour routes admin
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/admin", request.url));
    }

    try {
      await verifyTokenEdge(token);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/auth/admin", request.url)
      );
      response.cookies.delete("admin_session");
      return response;
    }
  }

  // 3. Protection session voter pour routes votants
  if (isVoterRoute && !isPublicPage) {
    const voterToken = request.cookies.get("voter_session")?.value;

    if (!voterToken) {
      // Rediriger vers page d'information au lieu d'erreur
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      await verifyTokenEdge(voterToken);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("voter_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
