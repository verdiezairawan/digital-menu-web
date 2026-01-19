"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type LoginResponse = {
  redirectTo?: unknown;
  error?: unknown;
};

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;
      if (!response.ok) {
        const message = typeof data.error === "string" ? data.error : "Login gagal.";
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
        </div>
      </div>
    </div>
  );
}
