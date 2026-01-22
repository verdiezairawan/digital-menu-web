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
      if (isFirebaseConfigured()) {
        try {
          const { loginWithEmailPassword } = await import("@/lib/firebase/auth");
          await loginWithEmailPassword(email, password);
        } catch (error) {
          setError(getFirebaseErrorMessage(error));
          return;
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;
      if (!response.ok) {
        const message = typeof data.error === "string" ? data.error : "Login gagal.";
        if (isFirebaseConfigured()) {
          try {
            const { logout } = await import("@/lib/firebase/auth");
            await logout();
          } catch {
            // ignore
          }
        }
        setError(message);
        return;
      }

      const redirectTo = typeof data.redirectTo === "string" ? data.redirectTo : "/dashboard";
      router.replace(safeNext ?? redirectTo);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo(email: string, password: string) {
    setError(null);
    setEmail(email);
    setPassword(password);
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

      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        <div className="mb-3 text-xs font-semibold tracking-wide text-foreground">
          Demo akun
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => fillDemo("unitmanager@demo.com", "manager123")}
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-primary-soft"
          >
            Unit Manager
          </button>
          <button
            type="button"
            onClick={() => fillDemo("storekeeper@demo.com", "storekeeper123")}
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-primary-soft"
          >
            Storekeeper
          </button>
          <button
            type="button"
            onClick={() => fillDemo("chef1@demo.com", "chef123")}
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-primary-soft"
          >
            Chef 1
          </button>
          <button
            type="button"
            onClick={() => fillDemo("chef2@demo.com", "chef123")}
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-primary-soft"
          >
            Chef 2
          </button>
          <button
            type="button"
            onClick={() => fillDemo("chef3@demo.com", "chef123")}
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-primary-soft"
          >
            Chef 3
          </button>
        </div>
        <div className="mt-3 text-xs text-muted">
          Untuk produksi, ganti autentikasi demo di{" "}
          <code className="font-mono text-foreground">src/lib/auth/demoUsers.ts</code>.
          <div className="mt-1">
            Kalau Firebase Auth diaktifin, pastiin akun demo ini juga dibuat di Firebase Authentication.
          </div>
        </div>
      </div>
    </div>
  );
}
