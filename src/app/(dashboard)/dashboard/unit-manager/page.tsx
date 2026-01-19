import { requireRole } from "@/lib/auth/session";

export default async function UnitManagerDashboardPage() {
  const session = await requireRole(["unit-manager"]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Unit Manager
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Selamat datang, {session.user.name}.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Ringkasan</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Area kontrol utama
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tempat yang pas untuk metrik penting: menu, inventori, dan status pesanan.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-accent-indigo/10 px-3 py-1 text-xs font-semibold text-accent-indigo">
              Fokus
            </span>
            <span className="inline-flex items-center rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
              Aksi cepat
            </span>
            <span className="inline-flex items-center rounded-full bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
              Insight
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Status</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">System</span>
              <span className="text-xs font-semibold text-success">OK</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Auth</span>
              <span className="text-xs font-semibold text-success">Enabled</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Role</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Akses terbatas
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Hanya role Unit Manager yang bisa membuka halaman ini.
          </p>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Next</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Integrasi data
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Hubungkan kartu-kartu ini ke API/DB untuk menampilkan data real.
          </p>
        </div>
      </div>
    </section>
  );
}

