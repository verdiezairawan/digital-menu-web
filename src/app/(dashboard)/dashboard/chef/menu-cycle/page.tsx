import { requireRole } from "@/lib/auth/session";

type Props = {
  searchParams?: {
    menu?: string;
  };
};

const MENU_OPTIONS = [
  { value: "menu-a", label: "Menu A" },
  { value: "menu-b", label: "Menu B" },
  { value: "menu-c", label: "Menu C" },
] as const;

type MenuValue = (typeof MENU_OPTIONS)[number]["value"];

type CycleStatus = "Draft" | "Published";

type CycleRow = {
  day: string;
  shift: string;
  items: string;
  status: CycleStatus;
};

const MENU_CYCLE_ROWS: Record<MenuValue, CycleRow[]> = {
  "menu-a": [
    { day: "Senin", shift: "Pagi", items: "Item A1 • Item A2", status: "Draft" },
    { day: "Selasa", shift: "Pagi", items: "Item A3 • Item A4", status: "Draft" },
    { day: "Rabu", shift: "Pagi", items: "Item A5 • Item A6", status: "Published" },
    { day: "Kamis", shift: "Pagi", items: "Item A7 • Item A8", status: "Published" },
    { day: "Jumat", shift: "Pagi", items: "Item A9 • Item A10", status: "Draft" },
  ],
  "menu-b": [
    { day: "Senin", shift: "Pagi", items: "Item B1 • Item B2", status: "Published" },
    { day: "Selasa", shift: "Pagi", items: "Item B3 • Item B4", status: "Draft" },
    { day: "Rabu", shift: "Pagi", items: "Item B5 • Item B6", status: "Draft" },
    { day: "Kamis", shift: "Pagi", items: "Item B7 • Item B8", status: "Published" },
    { day: "Jumat", shift: "Pagi", items: "Item B9 • Item B10", status: "Draft" },
  ],
  "menu-c": [
    { day: "Senin", shift: "Pagi", items: "Item C1 • Item C2", status: "Draft" },
    { day: "Selasa", shift: "Pagi", items: "Item C3 • Item C4", status: "Published" },
    { day: "Rabu", shift: "Pagi", items: "Item C5 • Item C6", status: "Published" },
    { day: "Kamis", shift: "Pagi", items: "Item C7 • Item C8", status: "Draft" },
    { day: "Jumat", shift: "Pagi", items: "Item C9 • Item C10", status: "Draft" },
  ],
};

export default async function ChefMenuCyclePage({ searchParams }: Props) {
  await requireRole(["unit-manager", "chef"]);

  const selectedMenu = MENU_OPTIONS.find((item) => item.value === searchParams?.menu) ?? null;
  const rows = selectedMenu ? MENU_CYCLE_ROWS[selectedMenu.value] : [];

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Chef
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Siklus Menu
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola siklus menu dan penjadwalan item.
        </p>
      </div>

      <div className="rounded-[28px] border border-border bg-surface p-7 shadow-sm">
        <div className="text-xs font-semibold tracking-wide text-muted">Pilih menu</div>
        <form className="mt-4 space-y-4" method="GET">
          <div className="space-y-2">
            <label htmlFor="menu" className="text-sm font-medium text-foreground">
              Menu
            </label>
            <select
              id="menu"
              name="menu"
              defaultValue={selectedMenu?.value ?? ""}
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10"
            >
              <option value="" disabled>
                Pilih menu...
              </option>
              {MENU_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Terapkan
          </button>
        </form>

        {selectedMenu ? (
          <div className="mt-6 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted">
            Menu terpilih:{" "}
            <span className="font-semibold text-foreground">{selectedMenu.label}</span>
          </div>
        ) : null}

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold tracking-wide text-muted">Tabel siklus</div>
            <div className="text-xs text-muted">Demo</div>
          </div>

          {selectedMenu ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-muted">
                      Hari
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-muted">
                      Shift
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-muted">
                      Items
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-muted">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={`${row.day}-${row.shift}`} className="text-foreground">
                      <td className="px-4 py-3 font-semibold">{row.day}</td>
                      <td className="px-4 py-3 text-muted">{row.shift}</td>
                      <td className="px-4 py-3">{row.items}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "Published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted">
              Pilih menu dulu untuk melihat tabel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
