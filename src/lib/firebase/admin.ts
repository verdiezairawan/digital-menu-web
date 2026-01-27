import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function stripOuterQuotes(value: string): string {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalized = stripOuterQuotes(trimmed).trim();
  return normalized ? normalized : null;
}

function mapServiceAccount(record: Record<string, unknown>): ServiceAccount {
  const projectId = typeof record.project_id === "string" ? record.project_id.trim() : "";
  const clientEmail =
    typeof record.client_email === "string" ? record.client_email.trim() : "";
  let privateKey =
    typeof record.private_key === "string" ? record.private_key.trim() : "";

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT tidak lengkap.");
  }

  return { projectId, clientEmail, privateKey };
}

function parseServiceAccount(raw: string): ServiceAccount {
  const normalized = stripOuterQuotes(raw).trim();
  if (!normalized) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT kosong.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized) as unknown;
  } catch {
    try {
      const decoded = Buffer.from(normalized, "base64").toString("utf8");
      parsed = JSON.parse(decoded) as unknown;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT tidak valid.");
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT tidak valid.");
  }

  return mapServiceAccount(parsed as Record<string, unknown>);
}

async function loadServiceAccountFromFile(filePath: string): Promise<ServiceAccount | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return mapServiceAccount(parsed as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function resolveServiceAccount(): Promise<ServiceAccount> {
  const rawServiceAccount = normalizeEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (rawServiceAccount) {
    return parseServiceAccount(rawServiceAccount);
  }

  const pathEnv =
    normalizeEnv(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) ||
    normalizeEnv(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (pathEnv) {
    const fromPath = await loadServiceAccountFromFile(pathEnv);
    if (fromPath) return fromPath;
  }

  const fallbackPath = path.join(process.cwd(), "firebase-service-account.json");
  const fallback = await loadServiceAccountFromFile(fallbackPath);
  if (fallback) return fallback;

  throw new Error("FIREBASE_SERVICE_ACCOUNT belum diset.");
}

async function initAdminApp(): Promise<void> {
  if (getApps().length > 0) return;
  const serviceAccount = await resolveServiceAccount();
  const envProjectId = normalizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  if (envProjectId && envProjectId !== serviceAccount.projectId) {
    throw new Error(
      `FIREBASE_PROJECT_MISMATCH:${serviceAccount.projectId}:${envProjectId}`,
    );
  }
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

export function getAdminFirestore() {
  if (getApps().length === 0) {
    throw new Error("FIREBASE_ADMIN_NOT_INITIALIZED");
  }

  return getFirestore();
}

export function getAdminAuth() {
  if (getApps().length === 0) {
    throw new Error("FIREBASE_ADMIN_NOT_INITIALIZED");
  }

  return getAuth();
}

export async function initAdminFirestore(): Promise<void> {
  await initAdminApp();
}

export async function initAdminAuth(): Promise<void> {
  await initAdminApp();
}
