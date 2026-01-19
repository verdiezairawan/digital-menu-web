import { requireRole } from "@/lib/auth/session";

export default async function ChefDashboardPage() {
  const session = await requireRole(["unit-manager", "chef"]);

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Chef
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Dashboard Chef
        </h1>
        <p className="mt-1 text-sm text-muted">Selamat datang, {session.user.name}.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Produksi</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Pesanan masuk, proses, selesai
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Desain bento ini cocok untuk membagi status: New, Cooking, Ready.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
              Cooking
            </span>
            <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              Ready
            </span>
            <span className="inline-flex items-center rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
              Rush
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Highlight</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Priority</span>
              <span className="text-xs font-semibold text-accent-cyan">Focus</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Timer</span>
              <span className="text-xs font-semibold text-muted">Demo</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Prep</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Checklist bahan
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Bisa dipakai untuk stok cepat atau prep list harian.
          </p>
        </div>

        <div className="col-span-12 sm:col-span-6 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Output</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Ready-to-serve
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tampilkan pesanan yang siap dikirim atau diambil.
          </p>
        </div>
      </div>
    </section>
  );
}

