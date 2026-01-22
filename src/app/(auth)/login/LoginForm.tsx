"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type LoginResponse = {
  redirectTo?: unknown;
  error?: unknown;
};

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  );
}

function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("Missing required environment variable")) {
    return "Firebase belum dikonfigurasi. Isi NEXT_PUBLIC_FIREBASE_* di .env.local.";
  }

  const code = (() => {
    if (!error || typeof error !== "object") return null;
    if (!("code" in error)) return null;
    const value = (error as { code?: unknown }).code;
    return typeof value === "string" ? value : null;
  })();

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email atau password salah.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case "auth/network-request-failed":
      return "Koneksi bermasalah. Coba lagi.";
    default:
      return "Login Firebase gagal.";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const safeNext = useMemo(() => {
    if (!nextParam) return null;
    if (!nextParam.startsWith("/")) return null;
    return nextParam;
  }, [nextParam]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        setError("Firebase belum dikonfigurasi. Isi NEXT_PUBLIC_FIREBASE_* di .env.local.");
        return;
      }

      let idToken: string;
      try {
        const { loginWithEmailPassword } = await import("@/lib/firebase/auth");
        const credential = await loginWithEmailPassword(email, password);
        idToken = await credential.user.getIdToken();
      } catch (error) {
        setError(getFirebaseErrorMessage(error));
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = (await response.json()) as LoginResponse;
      if (!response.ok) {
        const message = typeof data.error === "string" ? data.error : "Login gagal.";
        try {
          const { logout } = await import("@/lib/firebase/auth");
          await logout();
        } catch {
          // ignore
        }
        setError(message);
        return;
      }

      const redirectTo = typeof data.redirectTo === "string" ? data.redirectTo : "/dashboard";
      router.replace(safeNext ?? redirectTo);
      router.refresh();
    } catch {
      try {
        const { logout } = await import("@/lib/firebase/auth");
        await logout();
      } catch {
        // ignore
      }
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Login</h1>
        <p className="text-sm leading-6 text-muted">
          Masuk untuk mengakses dashboard sesuai role.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
            placeholder="contoh@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
