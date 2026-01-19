import "server-only";

import crypto from "node:crypto";

import { SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { isRole, type AuthUser } from "@/lib/auth/roles";

type TokenPayload = {
  user: AuthUser;
  exp: number; // unix seconds
};

function encodeBase64Url(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeBase64UrlJson<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function signHmacSha256Base64Url(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(
  user: AuthUser,
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { user, exp: now + ttlSeconds };

  const headerPart = encodeBase64Url(header);
  const payloadPart = encodeBase64Url(payload);
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = signHmacSha256Base64Url(signingInput, secret);

  return `${signingInput}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signature] = parts;
  const signingInput = `${headerPart}.${payloadPart}`;
  const expected = signHmacSha256Base64Url(signingInput, secret);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  let payload: TokenPayload;
  try {
    payload = decodeBase64UrlJson<TokenPayload>(payloadPart);
  } catch {
    return null;
  }

  if (!payload || typeof payload.exp !== "number") return null;
  if (!payload.user || typeof payload.user !== "object") return null;
  if (typeof payload.user.id !== "string") return null;
  if (typeof payload.user.email !== "string") return null;
  if (typeof payload.user.name !== "string") return null;
  if (!isRole(payload.user.role)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return null;

  return payload;
}

