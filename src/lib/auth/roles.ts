export const roles = ["superadmin", "unit-manager", "storekeeper", "chef"] as const;

export type Role = (typeof roles)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  siteId: string;
};
