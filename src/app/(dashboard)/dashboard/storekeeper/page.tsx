import { requireRole } from "@/lib/auth/session";

export default async function StorekeeperDashboardPage() {
  const session = await requireRole(["unit-manager", "storekeeper"]);

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Storekeeper
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Dashboard Storekeeper
        </h1>
        <p className="mt-1 text-sm text-muted">Selamat datang, {session.user.name}.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Inventori</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Terima barang & stok opname
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Area ini cocok untuk fitur Barang Masuk, Barang Keluar, dan Stok Minimum.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
              Reorder
            </span>
            <span className="inline-flex items-center rounded-full bg-accent-indigo/10 px-3 py-1 text-xs font-semibold text-accent-indigo">
              Audit
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Status gudang</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Stock</span>
              <span className="text-xs font-semibold text-warning">Demo</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Supplier</span>
              <span className="text-xs font-semibold text-muted">Not configured</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Barang masuk</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Penerimaan & quality check
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Catat penerimaan bahan dan pastikan kualitas sesuai standar.
          </p>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Barang keluar</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Ke produksi / outlet
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Kurangi stok saat barang dikeluarkan untuk proses produksi.
          </p>
        </div>
      </div>
    </section>
  );
}
