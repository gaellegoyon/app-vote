// Fonctions de sécurité pour Node.js runtime (API routes)
import * as argon2 from "argon2";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

export async function hashPassword(pwd: string) {
  return argon2.hash(pwd, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, pwd: string) {
  return argon2.verify(hash, pwd);
}

// Pseudonymisation (HMAC) d'un identifiant votant (ex: email)
export function hmacPseudo(input: string) {
  const key = process.env.HMAC_SECRET!;
  return crypto.createHmac("sha256", key).update(input).digest("hex");
}

// JWT pour API routes (Node.js runtime)
const ALGO = "HS256";
function getJwtKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn = "15m"
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGO })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtKey());
}

export async function verifyToken<T = Record<string, unknown>>(
  token: string
): Promise<T> {
  const { payload } = await jwtVerify(token, getJwtKey());
  return payload as T;
}
