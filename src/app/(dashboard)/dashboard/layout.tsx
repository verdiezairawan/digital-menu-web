import DashboardShell from "@/components/shared/DashboardShell";
import { getRoleLabel } from "@/lib/auth/roleLabel";
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

  const visibleNav =
    session.user.role === "chef"
      ? [
          { href: "/dashboard/chef", label: "Dashboard" },
          { href: "/dashboard/chef/menu-cycle", label: "Siklus Menu" },
          { href: "/dashboard/chef/raw-materials/add", label: "Add Raw Material" },
          { href: "/dashboard/chef/raw-materials", label: "Raw Material Data" },
          { href: "/dashboard/chef/recipes/new", label: "Create New Recipe" },
          { href: "/dashboard/chef/recipes", label: "Recipe Data" },
          { href: "/dashboard/chef/store-request", label: "Store Request" },
        ]
      : navItems
          .filter((i) => i.roles.includes(session.user.role))
          .map(({ href, label }) => ({ href, label }));

  return (
    <DashboardShell
      user={{ name: session.user.name, roleLabel, siteId: session.user.siteId }}
      navItems={visibleNav}
    >
      {children}
    </DashboardShell>
  );
}
