import crypto from "node:crypto";

const KEY = (process.env.DATA_ENC_KEY || "").slice(0, 32); // simple demo
const IVLEN = 12;

export function enc(data: string): string {
  const iv = crypto.randomBytes(IVLEN);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(KEY), iv);
  const enc = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function dec(b64: string): string {
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, IVLEN);
  const tag = raw.subarray(IVLEN, IVLEN + 16);
  const data = raw.subarray(IVLEN + 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(KEY), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
