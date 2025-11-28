import { authenticator } from "otplib";
import crypto from "node:crypto";

authenticator.options = { window: 1 }; // tolérance temps

export function generateTotpSecret() {
  return authenticator.generateSecret(); // base32
}

export function verifyTotp(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

// Option: signer un JTI aléatoire
export function randomId() {
  return crypto.randomBytes(16).toString("hex");
}
