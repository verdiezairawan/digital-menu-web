import type { Role } from "@/lib/auth/roles";

export function getRoleRedirectPath(role: Role): string {
  switch (role) {
    case "unit-manager":
      return "/dashboard/unit-manager";
    case "storekeeper":
      return "/dashboard/storekeeper";
    case "chef":
      return "/dashboard/chef";
  }
}
