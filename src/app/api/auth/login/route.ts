import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { getRoleRedirectPath } from "@/lib/auth/redirect";
import { resolveRoleForEmail } from "@/lib/auth/roleMapping";
import { getAuthSecret } from "@/lib/auth/secret";
import { resolveSiteForEmail } from "@/lib/auth/siteMapping";
import { createSessionToken } from "@/lib/auth/token";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { getUserByEmail } from "@/lib/users/store";

export const runtime = "nodejs";

type LoginBody = {
  idToken?: unknown;
};

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const idToken = typeof body.idToken === "string" ? body.idToken.trim() : "";
  if (!idToken) {
    return NextResponse.json(
      { error: "Token login wajib diisi." },
      { status: 400 },
    );
  }

  let firebaseUser;
  try {
    firebaseUser = await verifyFirebaseIdToken(idToken);
  } catch {
    return NextResponse.json(
      { error: "Gagal verifikasi login. Coba lagi." },
      { status: 500 },
    );
  }

  if (!firebaseUser) {
    return NextResponse.json({ error: "Login tidak valid." }, { status: 401 });
  }

  let storedUser = null;
  try {
    storedUser = await getUserByEmail(firebaseUser.email);
  } catch {
    storedUser = null;
  }
  if (storedUser?.status === "inactive") {
    return NextResponse.json(
      { error: "Akun sedang dinonaktifkan. Hubungi admin." },
      { status: 403 },
    );
  }

  const role = storedUser?.role ?? resolveRoleForEmail(firebaseUser.email);
  if (!role) {
    return NextResponse.json(
      { error: "Akun belum punya role. Hubungi admin." },
      { status: 403 },
    );
  }

  const siteId = storedUser?.siteId ?? resolveSiteForEmail(firebaseUser.email);
  if (!siteId) {
    return NextResponse.json(
      { error: "Akun belum terdaftar ke outlet/site. Hubungi admin." },
      { status: 403 },
    );
  }

  const user = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: storedUser?.name ?? firebaseUser.name ?? firebaseUser.email,
    role,
    siteId,
  };

  const secret = getAuthSecret();
  const token = createSessionToken(user, secret);

  const response = NextResponse.json(
    { user, redirectTo: getRoleRedirectPath(user.role) },
    { status: 200 },
  );

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
