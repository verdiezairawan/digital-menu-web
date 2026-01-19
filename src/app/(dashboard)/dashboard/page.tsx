import { redirect } from "next/navigation";

import { getRoleRedirectPath } from "@/lib/auth/redirect";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardIndexPage() {
  const session = await requireSession();
  redirect(getRoleRedirectPath(session.user.role));
}

