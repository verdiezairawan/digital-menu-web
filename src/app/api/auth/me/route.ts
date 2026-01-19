import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAuthSecret } from "@/lib/auth/secret";
import { verifySessionToken } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const secret = getAuthSecret();
  const payload = verifySessionToken(token, secret);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: payload.user }, { status: 200 });
}

