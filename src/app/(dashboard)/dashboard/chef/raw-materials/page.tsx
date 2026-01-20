import { requireRole } from "@/lib/auth/session";

export default async function ChefRawMaterialsPage() {
  await requireRole(["unit-manager", "chef"]);

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Chef
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Raw Material Data
        </h1>
        <p className="mt-1 text-sm text-muted">Daftar dan detail data bahan baku.</p>
      </div>

      <div className="rounded-[28px] border border-border bg-surface p-7 shadow-sm">
        <div className="text-xs font-semibold tracking-wide text-muted">Coming soon</div>
        <p className="mt-2 text-sm leading-6 text-muted">
          Tabel/list bahan baku akan ditampilkan di sini.
        </p>
      </div>
    </section>
  );
}

