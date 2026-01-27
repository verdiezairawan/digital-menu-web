"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

type UserRecord = {
  id: string;
  authUid: string | null;
  name: string;
  email: string;
  jobPosition: string;
  siteId: string;
  phone: string;
  role: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
};

type ImportRow = {
  name: string;
  email: string;
  jobPosition: string;
  siteId: string;
  phone: string;
  role: string;
  errors: string[];
};

const roleOptions = [
  { value: "superadmin", label: "Super Admin" },
  { value: "unit-manager", label: "Unit Manager" },
  { value: "storekeeper", label: "Storekeeper" },
  { value: "chef", label: "Chef" },
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  jobPosition: "",
  siteId: "",
  phone: "",
  role: "unit-manager",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function inferRole(jobPosition: string): string {
  const normalized = jobPosition.trim().toLowerCase();
  if (normalized.includes("super")) return "superadmin";
  if (normalized.includes("chef")) return "chef";
  if (normalized.includes("storekeeper")) return "storekeeper";
  if (normalized.includes("store")) return "storekeeper";
  if (normalized.includes("unit")) return "unit-manager";
  if (normalized.includes("manager")) return "unit-manager";
  return "";
}

export default function SuperAdminClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<{
    created: Array<{ email: string; tempPassword: string }>;
    failed: Array<{ email: string; reason: string }>;
  } | null>(null);

  const validImportRows = useMemo(
    () => importRows.filter((row) => row.errors.length === 0),
    [importRows],
  );

  async function parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const data = await parseResponse<{ users?: UserRecord[]; error?: string }>(response);
      if (!response.ok) {
        setError(data.error ?? "Gagal memuat data user.");
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError("Gagal memuat data user.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTempPassword(null);

    if (
      !form.name ||
      !form.email ||
      (!editingId && !form.password) ||
      !form.jobPosition ||
      !form.siteId ||
      !form.phone
    ) {
      setError("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        ...(editingId ? {} : { password: form.password }),
        jobPosition: form.jobPosition,
        siteId: form.siteId,
        phone: form.phone,
        role: form.role,
      };

      const response = await fetch(
        editingId ? `/api/admin/users/${editingId}` : "/api/admin/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await parseResponse<{ error?: string; tempPassword?: string }>(response);
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan user.");
        return;
      }

      if (!editingId && data.tempPassword) {
        setTempPassword(data.tempPassword);
      }

      resetForm();
      await loadUsers();
    } catch {
      setError("Gagal menyimpan user.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(user: UserRecord) {
    const confirmed = window.confirm(`Hapus user ${user.email}?`);
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    const targetId = user.email?.trim() || user.id || user.authUid;
    if (!targetId) {
      setError("User tidak punya ID untuk dihapus.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id ?? "",
          email: user.email ?? "",
          authUid: user.authUid ?? "",
        }),
      });
      const data = await parseResponse<{ error?: string }>(response);
      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus user.");
        return;
      }
      await loadUsers();
    } catch {
      setError("Gagal menghapus user.");
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(user: UserRecord) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      jobPosition: user.jobPosition,
      siteId: user.siteId,
      phone: user.phone,
      role: user.role,
    });
    setEditingId(user.id);
    setTempPassword(null);
  }

  async function handleImport() {
    setIsLoading(true);
    setError(null);
    setImportSummary(null);
    try {
      const response = await fetch("/api/admin/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: validImportRows }),
      });
      const data = await parseResponse<{
        created?: Array<{ email: string; tempPassword: string }>;
        failed?: Array<{ email: string; reason: string }>;
        error?: string;
      }>(response);

      if (!response.ok) {
        setError(data.error ?? "Gagal import user.");
        return;
      }

      const created = Array.isArray(data.created) ? data.created : [];
      const failed = Array.isArray(data.failed) ? data.failed : [];
      setImportSummary({ created, failed });
      setImportRows([]);
      await loadUsers();
    } catch {
      setError("Gagal import user.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportSummary(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
      if (!sheet) {
        setError("Sheet Excel tidak ditemukan.");
        return;
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsed = rawRows.map((row) => {
        const normalized: Record<string, string> = {};
        Object.entries(row).forEach(([key, value]) => {
          normalized[normalizeKey(String(key))] = String(value ?? "").trim();
        });

        const name = normalized.name || normalized.nama || "";
        const jobPosition = normalized.job_position || normalized.jabatan || "";
        const siteId =
          normalized.office_site ||
          normalized.office ||
          normalized.site ||
          normalized.site_id ||
          normalized.outlet ||
          "";
        const phone =
          normalized.phone ||
          normalized.no_tlp ||
          normalized.no_telp ||
          normalized.no_hp ||
          normalized.telepon ||
          normalized.telp ||
          "";
        const email = normalized.email || normalized.e_mail || "";
        const role = normalized.role || inferRole(jobPosition);

        const errors: string[] = [];
        if (!name) errors.push("Nama kosong");
        if (!jobPosition) errors.push("Job position kosong");
        if (!siteId) errors.push("Office/Site kosong");
        if (!phone) errors.push("No Tlp kosong");
        if (!email) errors.push("Email kosong");
        if (!role) errors.push("Role tidak dikenali");

        return {
          name,
          email: email.toLowerCase(),
          jobPosition,
          siteId,
          phone,
          role,
          errors,
        };
      });

      setImportRows(parsed);
    } catch {
      setError("Gagal membaca file Excel.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Super Admin
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Manage User
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tambah akun, kelola role, dan impor data user dari Excel.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div>
            <div className="text-xs font-semibold tracking-wide text-muted">Import Excel</div>
            <p className="mt-1 text-sm text-muted">
              Kolom wajib: name, job_position, office_site, phone, email. Opsional: role.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-soft/80"
            />
            <button
              type="button"
              disabled={isLoading || validImportRows.length === 0}
              onClick={handleImport}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Import
            </button>
          </div>

          {importSummary ? (
            <div className="mt-3 space-y-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  Berhasil: {importSummary.created.length}
                </span>
                <span className="font-semibold text-danger">
                  Gagal: {importSummary.failed.length}
                </span>
              </div>
              {importSummary.created.length > 0 ? (
                <div className="rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-success">
                  <div className="text-xs font-semibold uppercase tracking-wide">Password Sementara</div>
                  <ul className="mt-2 space-y-1 text-xs">
                    {importSummary.created.map((item) => (
                      <li key={item.email}>
                        {item.email}: <span className="font-semibold">{item.tempPassword}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {importSummary.failed.length > 0 ? (
                <div className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-danger">
                  <div className="text-xs font-semibold uppercase tracking-wide">Gagal</div>
                  <ul className="mt-2 space-y-1 text-xs">
                    {importSummary.failed.map((item) => (
                      <li key={`${item.email}-${item.reason}`}>
                        {item.email}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {importRows.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
              <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 text-xs font-semibold text-muted">
                <span>Preview Import</span>
                <span>
                  Valid: {validImportRows.length} / {importRows.length}
                </span>
              </div>
              <div className="max-h-[320px] overflow-auto bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-xs uppercase tracking-wide text-muted">
                      <th className="px-4 py-2">Nama</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Job</th>
                      <th className="px-4 py-2">Site</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row, index) => (
                      <tr
                        key={`${row.email}-${index}`}
                        className="border-t border-border/60"
                      >
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.email}</td>
                        <td className="px-4 py-2">{row.jobPosition}</td>
                        <td className="px-4 py-2">{row.siteId}</td>
                        <td className="px-4 py-2">
                          {row.errors.length > 0 ? (
                            <span className="text-danger">
                              {row.errors.join(", ")}
                            </span>
                          ) : (
                            <span className="text-success">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-muted">
            {editingId ? "Edit user" : "Tambah user"}
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nama</label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="email@domain.com"
                disabled={Boolean(editingId)}
              />
            </div>
            {!editingId ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job Position</label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.jobPosition}
                onChange={(event) => setForm({ ...form, jobPosition: event.target.value })}
                placeholder="Contoh: Unit Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Office/Site</label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.siteId}
                onChange={(event) => setForm({ ...form, siteId: event.target.value })}
                placeholder="site-dev"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">No. Tlp</label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? "Update User" : "Buat User"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-primary-soft"
                >
                  Batal
                </button>
              ) : null}
            </div>
          </form>
          {tempPassword ? (
            <div className="mt-4 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              Password sementara: <span className="font-semibold">{tempPassword}</span>
            </div>
          ) : null}
        </div>

        <div className="col-span-12 lg:col-span-8 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-muted">Daftar user</div>
              <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Total {users.length} akun
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-primary-soft"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <div className="overflow-auto bg-white">
              <table className="min-w-[920px] text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Site</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-border/60">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.jobPosition}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">{user.siteId}</td>
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary-soft"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            className="inline-flex items-center rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                        Belum ada data user.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
