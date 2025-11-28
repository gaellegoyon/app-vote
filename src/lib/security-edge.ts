// Fonctions de sécurité compatibles Edge Runtime (pour middleware)
import { SignJWT, jwtVerify } from "jose";

// JWT pour middleware (compatible Edge Runtime)
const ALGO = "HS256";
function getJwtKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function verifyTokenEdge<T = Record<string, unknown>>(
  token: string
): Promise<T> {
  const { payload } = await jwtVerify(token, getJwtKey());
  return payload as T;
}

export async function signTokenEdge(
  payload: Record<string, unknown>,
  expiresIn = "15m"
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGO })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtKey());
}