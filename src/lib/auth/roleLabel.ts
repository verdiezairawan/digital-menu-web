import type { Role } from "@/lib/auth/roles";

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "unit-manager":
      return "Unit Manager";
    case "storekeeper":
      return "Storekeeper";
    case "chef":
      return "Chef";
  }
}
