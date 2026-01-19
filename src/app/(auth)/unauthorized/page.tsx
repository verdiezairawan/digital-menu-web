import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tidak Diizinkan",
};

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-[520px] w-[520px] rounded-full bg-danger/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-[480px] w-[480px] rounded-full bg-primary-soft blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md rounded-[28px] border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Akses ditolak</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Role Anda tidak punya akses ke halaman ini.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-primary-soft"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
