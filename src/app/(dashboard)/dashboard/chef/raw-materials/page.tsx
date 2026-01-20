import Link from "next/link";

import { requireRole } from "@/lib/auth/session";

import RawMaterialTable from "./RawMaterialTable";

export default async function ChefRawMaterialsPage() {
  await requireRole(["unit-manager", "chef"]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Chef
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Raw Material Data
          </h1>
          <p className="mt-1 text-sm text-muted">Daftar dan detail data bahan baku.</p>
        </div>

        <Link
          href="/dashboard/chef/raw-materials/add"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Add Raw Material
        </Link>
      </div>

      <RawMaterialTable />
    </section>
  );
}
