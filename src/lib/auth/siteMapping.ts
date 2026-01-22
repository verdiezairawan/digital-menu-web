import "server-only";

const DEFAULT_DEV_SITE_ID = "site-dev";

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

function parseSiteMap(raw: string): Map<string, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("AUTH_SITE_BY_EMAIL harus berupa JSON object yang valid.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AUTH_SITE_BY_EMAIL harus berupa JSON object.");
  }

  const map = new Map<string, string>();
  for (const [email, siteId] of Object.entries(parsed)) {
    if (typeof email !== "string" || typeof siteId !== "string") continue;
    const normalizedEmail = normalizeEmail(email);
    const normalizedSiteId = siteId.trim();
    if (!normalizedEmail || !normalizedSiteId) continue;
    map.set(normalizedEmail, normalizedSiteId);
  }

  return map;
}

let cachedSiteMap: Map<string, string> | null = null;
let cachedSiteMapRaw: string | null = null;

function getSiteMap(): Map<string, string> | null {
  const raw = normalizeEnv(process.env.AUTH_SITE_BY_EMAIL);
  if (!raw) {
    cachedSiteMapRaw = null;
    cachedSiteMap = null;
    return null;
  }

  if (cachedSiteMap && cachedSiteMapRaw === raw) return cachedSiteMap;

  cachedSiteMapRaw = raw;
  cachedSiteMap = parseSiteMap(raw);
  return cachedSiteMap;
}

export function resolveSiteForEmail(email: string): string | null {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const map = getSiteMap();
  const mappedSite = map?.get(normalizedEmail);
  if (mappedSite) return mappedSite;

  const defaultSite = normalizeEnv(process.env.AUTH_DEFAULT_SITE);
  if (defaultSite) return defaultSite;

  if (process.env.NODE_ENV !== "production") return DEFAULT_DEV_SITE_ID;

  return null;
}
