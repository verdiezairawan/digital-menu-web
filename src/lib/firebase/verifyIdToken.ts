import "server-only";

export type VerifiedFirebaseUser = {
  uid: string;
  email: string;
  name: string | null;
};

type LookupResponse = {
  users?: Array<{
    localId?: unknown;
    email?: unknown;
    displayName?: unknown;
  }>;
};

type LookupErrorResponse = {
  error?: {
    message?: unknown;
  };
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

function getFirebaseApiKey(): string {
  const apiKey = normalizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  if (apiKey) return apiKey;
  throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY belum di-set.");
}

function isInvalidTokenMessage(message: string): boolean {
  return (
    message === "INVALID_ID_TOKEN" ||
    message === "TOKEN_EXPIRED" ||
    message === "USER_DISABLED" ||
    message === "USER_NOT_FOUND"
  );
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  const trimmed = idToken.trim();
  if (!trimmed) return null;

  const apiKey = getFirebaseApiKey();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: trimmed }),
    },
  );

  if (!response.ok) {
    let message = "";
    try {
      const data = (await response.json()) as LookupErrorResponse;
      message = typeof data.error?.message === "string" ? data.error.message : "";
    } catch {
      // ignore
    }

    if (message && isInvalidTokenMessage(message)) return null;

    throw new Error(`Gagal verifikasi Firebase token (${response.status}).`);
  }

  const data = (await response.json()) as LookupResponse;
  const user = data.users?.[0];
  if (!user) return null;

  const uid = typeof user.localId === "string" ? user.localId.trim() : "";
  const email = typeof user.email === "string" ? user.email.trim() : "";
  const displayName =
    typeof user.displayName === "string" ? user.displayName.trim() : "";

  if (!uid || !email) return null;

  return { uid, email, name: displayName || null };
}
