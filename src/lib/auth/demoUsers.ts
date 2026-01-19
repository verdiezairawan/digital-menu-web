import "server-only";

import type { AuthUser, Role } from "@/lib/auth/roles";

type DemoUser = AuthUser & { password: string };

const DEMO_USERS: DemoUser[] = [
  {
    id: "u_unit_manager",
    email: "unitmanager@demo.com",
    name: "Unit Manager",
    role: "unit-manager",
    password: "manager123",
  },
  {
    id: "u_storekeeper",
    email: "storekeeper@demo.com",
    name: "Storekeeper",
    role: "storekeeper",
    password: "storekeeper123",
  },
  {
    id: "u_chef_1",
    email: "chef1@demo.com",
    name: "Chef 1",
    role: "chef",
    password: "chef123",
  },
  {
    id: "u_chef_2",
    email: "chef2@demo.com",
    name: "Chef 2",
    role: "chef",
    password: "chef123",
  },
  {
    id: "u_chef_3",
    email: "chef3@demo.com",
    name: "Chef 3",
    role: "chef",
    password: "chef123",
  },
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function authenticateDemoUser(email: string, password: string): AuthUser | null {
  const normalized = normalizeEmail(email);
  const user = DEMO_USERS.find((u) => normalizeEmail(u.email) === normalized);
  if (!user) return null;
  if (user.password !== password) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "unit-manager":
      return "Unit Manager";
    case "storekeeper":
      return "Storekeeper";
    case "chef":
      return "Chef";
  }
}
