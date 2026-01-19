import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAuthSecret } from "@/lib/auth/secret";
import { verifySessionToken } from "@/lib/auth/token";
import type { AuthUser, Role } from "@/lib/auth/roles";

export type Session = {
  user: AuthUser;
  expiresAt: number; // unix ms
};

export function getSessionFromToken(token: string | undefined): Session | null {
  if (!token) return null;

  const secret = getAuthSecret();
  const payload = verifySessionToken(token, secret);
  if (!payload) return null;

  return { user: payload.user, expiresAt: payload.exp * 1000 };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getSessionFromToken(token);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(allowedRoles: readonly Role[]): Promise<Session> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role)) redirect("/unauthorized");
  return session;
}

