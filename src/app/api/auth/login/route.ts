import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { getRoleRedirectPath } from "@/lib/auth/redirect";
import { resolveRoleForEmail } from "@/lib/auth/roleMapping";
import { getAuthSecret } from "@/lib/auth/secret";
import { resolveSiteForEmail } from "@/lib/auth/siteMapping";
import { createSessionToken } from "@/lib/auth/token";
import { getRoleLabel } from "@/lib/auth/roleLabel";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { getUserByEmail, upsertUserRecordByEmail } from "@/lib/users/store";

export const runtime = "nodejs";

type LoginBody = {
  idToken?: unknown;
};

function normalizeBooleanEnv(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return null;
}

function shouldAutoProvision(): boolean {
  const override = normalizeBooleanEnv(process.env.AUTH_ALLOW_AUTO_PROVISION);
  if (override !== null) return override;
  return process.env.NODE_ENV !== "production";
}

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

  const mappedRole = resolveRoleForEmail(firebaseUser.email);
  const mappedSiteId = resolveSiteForEmail(firebaseUser.email);

  let storedUser = null;
  try {
    storedUser = await getUserByEmail(firebaseUser.email);
  } catch {
    return NextResponse.json(
      { error: "Database user belum siap. Hubungi admin." },
      { status: 500 },
    );
  }

  if (!storedUser && shouldAutoProvision() && mappedRole && mappedSiteId) {
    try {
      const { user } = await upsertUserRecordByEmail({
        email: firebaseUser.email,
        name: firebaseUser.name ?? firebaseUser.email,
        jobPosition: getRoleLabel(mappedRole),
        siteId: mappedSiteId,
        phone: "-",
        role: mappedRole,
        status: "active",
        authUid: firebaseUser.uid,
      });
      storedUser = user;
    } catch {
      // If provisioning fails, fall back to the normal "not registered" error below.
    }
  }

  if (storedUser?.status === "inactive") {
    return NextResponse.json(
      { error: "Akun sedang dinonaktifkan. Hubungi admin." },
      { status: 403 },
    );
  }

  if (!storedUser) {
    return NextResponse.json(
      { error: "Akun belum terdaftar di database. Hubungi admin." },
      { status: 403 },
    );
  }

  const role = storedUser?.role ?? mappedRole;
  if (!role) {
    return NextResponse.json(
      { error: "Akun belum punya role. Hubungi admin." },
      { status: 403 },
    );
  }

  const siteId = storedUser?.siteId ?? mappedSiteId;
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
