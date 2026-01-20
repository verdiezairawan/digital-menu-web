"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  addRawMaterial,
  getRawMaterialsServerSnapshot,
  RAW_MATERIAL_UNITS,
  readRawMaterials,
  subscribeRawMaterials,
  type RawMaterialUnit,
} from "../rawMaterialStore";

type FormState = {
  name: string;
  category: string;
  unit: RawMaterialUnit | "";
  unitCost: string;
  stock: string;
  notes: string;
};

const DEFAULT_STATE: FormState = {
  name: "",
  category: "",
  unit: "",
  unitCost: "",
  stock: "",
  notes: "",
};

function parseNonNegativeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return null;
  return num;
}

export default function AddRawMaterialForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);

  const materials = useSyncExternalStore(
    subscribeRawMaterials,
    readRawMaterials,
    getRawMaterialsServerSnapshot,
  );
  const recentMaterials = materials.slice(0, 5);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessName(null);

    const name = form.name.trim();
    if (!name) {
      setError("Nama raw material wajib diisi.");
      return;
    }

    if (!form.unit) {
      setError("Unit wajib dipilih.");
      return;
    }

    const unitCost = parseNonNegativeNumber(form.unitCost);
    if (unitCost === null) {
      setError("Unit cost harus berupa angka non-negatif.");
      return;
    }

    const stock = parseNonNegativeNumber(form.stock);
    if (stock === null) {
      setError("Stock harus berupa angka non-negatif.");
      return;
    }

    addRawMaterial({
      name,
      category: form.category.trim(),
      unit: form.unit,
      unitCost,
      stock,
      notes: form.notes.trim(),
    });

    setSuccessName(name);
    setForm(DEFAULT_STATE);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
        <div className="text-xs font-semibold tracking-wide text-muted">Form</div>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
              placeholder="contoh: Ayam Fillet"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-foreground">
                Category
              </label>
              <input
                id="category"
                name="category"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                placeholder="contoh: Protein"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 space-y-2">
              <label htmlFor="unit" className="text-sm font-medium text-foreground">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value as RawMaterialUnit)}
              >
                <option value="" disabled>
                  Pilih unit...
                </option>
                {RAW_MATERIAL_UNITS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 space-y-2">
              <label htmlFor="unitCost" className="text-sm font-medium text-foreground">
                Unit Cost (IDR)
              </label>
              <input
                id="unitCost"
                name="unitCost"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                placeholder="contoh: 25000"
                value={form.unitCost}
                onChange={(e) => updateField("unitCost", e.target.value)}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 space-y-2">
              <label htmlFor="stock" className="text-sm font-medium text-foreground">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                placeholder="contoh: 12"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
              placeholder="opsional"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {successName ? (
            <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              Raw material <span className="font-semibold">{successName}</span> berhasil ditambahkan.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Simpan
            </button>
            <Link
              href="/dashboard/chef/raw-materials"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-medium text-foreground hover:bg-primary-soft"
            >
              Lihat data
            </Link>
          </div>
        </form>
      </div>

      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">Tips</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>Gunakan unit yang konsisten untuk memudahkan perhitungan resep.</li>
            <li>Unit cost dipakai sebagai harga per unit.</li>
            <li>Stock bersifat demo (tersimpan di browser).</li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold tracking-wide text-muted">Recent</div>
            <Link href="/dashboard/chef/raw-materials" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentMaterials.length > 0 ? (
              recentMaterials.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-background px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                    <div className="truncate text-xs text-muted">
                      {item.category ? `${item.category} • ` : ""}
                      {item.unit}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-muted">{item.stock}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted">
                Belum ada raw material.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
