import { requireRole } from "@/lib/auth/session";

import SuperAdminClient from "./SuperAdminClient";

export default async function SuperAdminDashboardPage() {
  await requireRole(["superadmin"]);

  return <SuperAdminClient />;
}
