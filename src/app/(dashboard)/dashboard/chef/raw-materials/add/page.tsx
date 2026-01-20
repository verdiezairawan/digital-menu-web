import { requireRole } from "@/lib/auth/session";

import AddRawMaterialForm from "./AddRawMaterialForm";

export default async function ChefAddRawMaterialPage() {
  await requireRole(["unit-manager", "chef"]);

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Chef
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Add Raw Material
        </h1>
        <p className="mt-1 text-sm text-muted">Tambahkan bahan baku baru untuk kebutuhan resep.</p>
      </div>

      <AddRawMaterialForm />
    </section>
  );
}
