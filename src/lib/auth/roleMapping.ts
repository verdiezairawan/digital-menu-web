import "server-only";

import { isRole, type Role } from "@/lib/auth/roles";

const DEFAULT_DEV_ROLE: Role = "unit-manager";

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseRoleMap(raw: string): Map<string, Role> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("AUTH_ROLE_BY_EMAIL harus berupa JSON object yang valid.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AUTH_ROLE_BY_EMAIL harus berupa JSON object.");
  }

  const map = new Map<string, Role>();
  for (const [email, role] of Object.entries(parsed)) {
    if (typeof email !== "string" || typeof role !== "string") continue;
    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = role.trim();
    if (!normalizedEmail) continue;
    if (!isRole(normalizedRole)) continue;
    map.set(normalizedEmail, normalizedRole);
  }

  return map;
}

let cachedRoleMap: Map<string, Role> | null = null;
let cachedRoleMapRaw: string | null = null;

function getRoleMap(): Map<string, Role> | null {
  const raw = normalizeEnv(process.env.AUTH_ROLE_BY_EMAIL);
  if (!raw) {
    cachedRoleMapRaw = null;
    cachedRoleMap = null;
    return null;
  }

  if (cachedRoleMap && cachedRoleMapRaw === raw) return cachedRoleMap;

  cachedRoleMapRaw = raw;
  cachedRoleMap = parseRoleMap(raw);
  return cachedRoleMap;
}

export function resolveRoleForEmail(email: string): Role | null {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const map = getRoleMap();
  const mappedRole = map?.get(normalizedEmail);
  if (mappedRole) return mappedRole;

  const defaultRole = normalizeEnv(process.env.AUTH_DEFAULT_ROLE);
  if (defaultRole && isRole(defaultRole)) return defaultRole;

  if (process.env.NODE_ENV !== "production") return DEFAULT_DEV_ROLE;

  return null;
}
