import "server-only";

import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionFromToken, type Session } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

export function getSessionFromRequest(request: NextRequest): Session | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getSessionFromToken(token);
}

export function requireRoleFromRequest(
  request: NextRequest,
  roles: readonly Role[],
): Session | null {
  const session = getSessionFromRequest(request);
  if (!session) return null;
  if (!roles.includes(session.user.role)) return null;
  return session;
}
