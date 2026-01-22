import Link from "next/link";

import { getRoleRedirectPath } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  const dashboardHref = session ? getRoleRedirectPath(session.user.role) : "/login";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-primary-soft blur-3xl" />
        <div className="absolute top-24 -right-24 h-[520px] w-[520px] rounded-full bg-accent-indigo/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-accent-cyan/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid grid-cols-12 gap-6">
          <main className="col-span-12 lg:col-span-5 rounded-[28px] border border-border bg-surface p-10 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              Digital Menu Web
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              Kelola menu dan pesanan lebih rapi
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Login untuk mengakses dashboard sesuai role: Unit Manager, Storekeeper, atau Chef.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={dashboardHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover"
              >
                {session ? "Ke Dashboard" : "Login"}
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-medium text-foreground hover:bg-primary-soft"
              >
                Buka Login
              </Link>
            </div>
          </main>

          <section className="col-span-12 lg:col-span-7">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 sm:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="text-xs font-semibold tracking-wide text-muted">Bento UI</div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  Layout card modular
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Cocok untuk ringkasan metrik, status pesanan, dan quick actions.
                </p>
              </div>

              <div className="col-span-12 sm:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="text-xs font-semibold tracking-wide text-muted">Primary</div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {session ? "Sudah login" : "Belum login"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {session ? `Role: ${session.user.role}` : "Silakan login untuk mulai."}
                </p>
              </div>

              <div className="col-span-12 sm:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="text-xs font-semibold tracking-wide text-muted">Accent</div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  Link/CTA sekunder
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Pakai <span className="font-medium text-accent-blue">accent blue</span>{" "}
                  untuk highlight yang modern.
                </p>
              </div>

              <div className="col-span-12 sm:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="text-xs font-semibold tracking-wide text-muted">Status</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    Success
                  </span>
                  <span className="inline-flex items-center rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    Warning
                  </span>
                  <span className="inline-flex items-center rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                    Danger
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Token warna status sudah tersedia sebagai class Tailwind.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
