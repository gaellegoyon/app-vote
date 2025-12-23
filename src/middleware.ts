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
  // Plages VPN autorisées (adapter selon votre configuration)
  const allowedIps = [
    "10.0.0.0/24", // Votre réseau DMZ (10.0.0.x)
    "10.10.0.0/24", // Ancien réseau (si applicable)
  ];

  if (process.env.NODE_ENV === "development") {
    return ip.includes("127.0.0.1") || ip.includes("::1") || ip === "";
  }

  // Fonction pour vérifier si une IP est dans une plage CIDR
  function ipInRange(ip: string, cidr: string) {
    const [range, bits] = cidr.split("/");
    const rangeParts = range.split(".").map(Number);
    const ipParts = ip.split(".").map(Number);
    const maskBits = parseInt(bits || "32");
    const maskBytes = Math.floor(maskBits / 8);

    for (let i = 0; i < maskBytes; i++) {
      if (rangeParts[i] !== ipParts[i]) return false;
    }

    if (maskBits % 8 !== 0) {
      const remainingBits = maskBits % 8;
      const mask = (0xff << (8 - remainingBits)) & 0xff;
      if ((rangeParts[maskBytes] & mask) !== (ipParts[maskBytes] & mask)) {
        return false;
      }
    }

    return true;
  }

  return allowedIps.some((range) => ipInRange(ip, range));
}
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pages publiques autorisées (landing page uniquement)
  const publicPages = [
    "/",
    "/favicon.ico",
    "/auth/complete", // Pour les liens d'invitation
    "/auth/login", // Pour la connexion des électeurs
    "/_next", // Assets Next.js
    "/api/auth/complete", // API pour compléter les invitations
    "/api/auth/login", // API pour la connexion des électeurs
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

  // 1. Protection VPN pour routes admin (sauf en développement)
  if (isAdminRoute && process.env.NODE_ENV === "production") {
    const ip = ipFrom(request);
    if (!allowed(ip)) {
      return new NextResponse("Forbidden - Admin access requires VPN", {
        status: 403,
      });
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
