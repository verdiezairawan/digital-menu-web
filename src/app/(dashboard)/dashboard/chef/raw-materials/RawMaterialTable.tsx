"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  getRawMaterialsServerSnapshot,
  readRawMaterials,
  refreshRawMaterials,
  subscribeRawMaterials,
  writeRawMaterials,
} from "./rawMaterialStore";

function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RawMaterialTable() {
  const [query, setQuery] = useState("");

  const items = useSyncExternalStore(
    subscribeRawMaterials,
    readRawMaterials,
    getRawMaterialsServerSnapshot,
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const category = item.category.toLowerCase();
      return name.includes(needle) || category.includes(needle) || item.unit.includes(needle);
    });
  }, [items, query]);

  function onDelete(id: string) {
    const material = items.find((item) => item.id === id);
    const name = material?.name ?? "raw material";
    if (!confirm(`Hapus ${name}?`)) return;

    const next = items.filter((item) => item.id !== id);
    writeRawMaterials(next);
  }

  function onClearAll() {
    if (!confirm("Hapus semua raw material (demo) dari browser ini?")) return;
    writeRawMaterials([]);
  }

  function onRefresh() {
    refreshRawMaterials();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted/70 focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
            placeholder="Cari raw material..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-primary-soft"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-danger/30 bg-white px-4 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            Clear
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Unit
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Unit Cost
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="text-foreground">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.name}</div>
                      {item.notes ? (
                        <div className="mt-1 line-clamp-1 text-xs text-muted">{item.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-muted">{item.category || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.stock > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatIdr(item.unitCost)}</td>
                    <td className="px-6 py-4 text-muted">{formatDateTime(item.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-danger/30 bg-white px-3 text-xs font-semibold text-danger hover:bg-danger/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-border bg-surface p-10 text-center shadow-sm">
          <div className="text-sm font-semibold text-foreground">Belum ada data</div>
          <div className="mt-2 text-sm text-muted">
            Tambahkan raw material dulu, lalu datanya akan muncul di sini.
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard/chef/raw-materials/add"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Add Raw Material
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
