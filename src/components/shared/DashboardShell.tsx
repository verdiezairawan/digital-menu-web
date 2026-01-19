"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import LogoutButton from "@/components/shared/LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  user: {
    name: string;
    roleLabel: string;
  };
  navItems: NavItem[];
  children: React.ReactNode;
};

function getInitials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "U";
  if (tokens.length === 1) return tokens[0]!.slice(0, 2).toUpperCase();
  return `${tokens[0]!.slice(0, 1)}${tokens[tokens.length - 1]!.slice(0, 1)}`.toUpperCase();
}

function NavIcon({ href }: { href: string }) {
  const base = "h-5 w-5";

  if (href.includes("/unit-manager")) {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (href.includes("/storekeeper")) {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7H20V20H4V7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M4 7L6 4H18L20 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 11H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 3V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 10H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6H18C19.1046 6 20 6.89543 20 8V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V8C4 6.89543 4.89543 6 6 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-primary transition-colors hover:bg-primary-soft ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export default function DashboardShell({ user, navItems, children }: Props) {
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  return (
    <div className="min-h-screen bg-background md:flex">
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity md:hidden ${isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface shadow-sm transition-[transform,width] duration-200 md:static md:z-auto md:translate-x-0 md:shadow-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        <div
          className={`flex h-16 items-center justify-between ${isCollapsed ? "gap-0 px-1" : "gap-3 px-4"}`}
        >
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setIsMobileOpen(false)}
          >
            <div
              className={`grid shrink-0 place-items-center rounded-2xl bg-primary-soft text-sm font-extrabold tracking-tight text-primary ${isCollapsed ? "h-9 w-9" : "h-10 w-10"}`}
            >
              DM
            </div>
            {!isCollapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">Digital Menu</div>
                <div className="truncate text-xs text-muted">{user.roleLabel}</div>
              </div>
            ) : null}
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <IconButton
                label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
                onClick={() => setIsCollapsed((v) => !v)}
                className={isCollapsed ? "h-9 w-9" : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d={isCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </div>

            <div className="md:hidden">
              <IconButton label="Tutup menu" onClick={() => setIsMobileOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3">
          <div className={`px-2 pb-2 text-xs font-semibold tracking-wide text-muted ${isCollapsed ? "md:hidden" : ""}`}>
            Menu
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center rounded-2xl py-2 text-sm font-semibold transition-colors ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} ${isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/70 hover:text-primary"}`}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-primary">
                    <NavIcon href={item.href} />
                  </div>
                  {!isCollapsed ? (
                    <span className="min-w-0 truncate">{item.label}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">
              {initials}
            </div>
            {!isCollapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{user.name}</div>
                <div className="truncate text-xs text-muted">{user.roleLabel}</div>
              </div>
            ) : null}
          </div>

          <div className={`mt-3 ${isCollapsed ? "flex justify-center" : ""}`}>
            <LogoutButton
              variant={isCollapsed ? "icon" : "default"}
              className={isCollapsed ? "" : "w-full justify-center"}
            />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur md:hidden">
          <IconButton label="Buka menu" onClick={() => setIsMobileOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>

          <div className="min-w-0 text-center">
            <div className="truncate text-sm font-semibold text-foreground">Dashboard</div>
            <div className="truncate text-xs text-muted">{user.roleLabel}</div>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">
            {initials}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
