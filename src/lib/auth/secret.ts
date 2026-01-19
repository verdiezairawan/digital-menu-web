import "server-only";

const DEFAULT_DEV_SECRET = "dev-secret-change-me";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }

  return DEFAULT_DEV_SECRET;
}

