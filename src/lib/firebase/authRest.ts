import "server-only";

type SignUpResponse = {
  localId?: unknown;
};

type ErrorResponse = {
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

function parseErrorMessage(data: ErrorResponse): string {
  return typeof data.error?.message === "string" ? data.error.message : "";
}

export async function createAuthUser(email: string, password: string): Promise<{ uid: string }> {
  const apiKey = getFirebaseApiKey();

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  if (!response.ok) {
    let message = "";
    try {
      const data = (await response.json()) as ErrorResponse;
      message = parseErrorMessage(data);
    } catch {
      // ignore
    }

    if (message === "EMAIL_EXISTS") {
      throw new Error("EMAIL_EXISTS");
    }

    throw new Error("FIREBASE_AUTH_CREATE_FAILED");
  }

  const data = (await response.json()) as SignUpResponse;
  const uid = typeof data.localId === "string" ? data.localId.trim() : "";
  if (!uid) {
    throw new Error("FIREBASE_AUTH_CREATE_FAILED");
  }

  return { uid };
}
