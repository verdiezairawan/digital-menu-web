import DashboardShell from "@/components/shared/DashboardShell";
import { getRoleLabel } from "@/lib/auth/demoUsers";
import { requireSession } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  const roleLabel = getRoleLabel(session.user.role);

  const navItems: Array<{ href: string; label: string; roles: Role[] }> = [
    { href: "/dashboard/unit-manager", label: "Unit Manager", roles: ["unit-manager"] },
    {
      href: "/dashboard/storekeeper",
      label: "Storekeeper",
      roles: ["unit-manager", "storekeeper"],
    },
    { href: "/dashboard/chef", label: "Chef", roles: ["unit-manager", "chef"] },
  ];

  const visibleNav = navItems
    .filter((i) => i.roles.includes(session.user.role))
    .map(({ href, label }) => ({ href, label }));

  return (
    <DashboardShell
      user={{ name: session.user.name, roleLabel }}
      navItems={visibleNav}
    >
      {children}
    </DashboardShell>
  );
}
