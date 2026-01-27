import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/api";
import { isRole, type Role } from "@/lib/auth/roles";
import { getAdminAuth, initAdminAuth } from "@/lib/firebase/admin";
import { upsertUserRecordByEmail } from "@/lib/users/store";

export const runtime = "nodejs";

type ImportRow = {
  name?: unknown;
  email?: unknown;
  jobPosition?: unknown;
  siteId?: unknown;
  phone?: unknown;
  role?: unknown;
};

type ImportBody = {
  users?: unknown;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

function inferRole(jobPosition: string): Role | null {
  const normalized = jobPosition.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("super")) return "superadmin";
  if (normalized.includes("chef")) return "chef";
  if (normalized.includes("storekeeper")) return "storekeeper";
  if (normalized.includes("store")) return "storekeeper";
  if (normalized.includes("unit")) return "unit-manager";
  if (normalized.includes("manager")) return "unit-manager";
  return null;
}

function generateTempPassword(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `Dm!${random}${suffix}`;
}

function isAuthEmailExists(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  if (code.includes("auth/email-already-exists")) return true;
  const message =
    "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes("email-already-exists");
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: ImportBody;
  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const users = Array.isArray(body.users) ? body.users : null;
  if (!users || users.length === 0) {
    return NextResponse.json({ error: "Data import kosong." }, { status: 400 });
  }

  const created: Array<{ email: string; tempPassword: string }> = [];
  const linked: Array<{ email: string }> = [];
  const failed: Array<{ email: string; reason: string }> = [];

  for (const row of users) {
    const data = row as ImportRow;
    const name = normalizeText(data.name);
    const email = normalizeText(data.email).toLowerCase();
    const jobPosition = normalizeText(data.jobPosition);
    const siteId = normalizeText(data.siteId);
    const phone = normalizeText(data.phone);
    const roleInput = normalizeText(data.role);
    const role = (roleInput && isRole(roleInput) ? roleInput : null) ?? inferRole(jobPosition);

    if (!name || !email || !jobPosition || !siteId || !phone || !role) {
      failed.push({ email: email || "(tanpa email)", reason: "Field wajib tidak lengkap." });
      continue;
    }

    if (!isValidEmail(email)) {
      failed.push({ email, reason: "Format email tidak valid." });
      continue;
    }

    const tempPassword = generateTempPassword();
    try {
      await initAdminAuth();
      const auth = getAdminAuth();
      let authUid = "";
      let authCreated = false;
      try {
        const createdAuth = await auth.createUser({ email, password: tempPassword });
        authUid = createdAuth.uid;
        authCreated = true;
        created.push({ email, tempPassword });
      } catch (authError) {
        if (isAuthEmailExists(authError)) {
          const existingAuth = await auth.getUserByEmail(email);
          authUid = existingAuth.uid;
          linked.push({ email });
        } else {
          throw authError;
        }
      }

      try {
        await upsertUserRecordByEmail({
          email,
          name,
          jobPosition,
          siteId,
          phone,
          role,
          status: "active",
          authUid,
        });
      } catch (storeError) {
        if (authCreated && authUid) {
          try {
            await auth.deleteUser(authUid);
          } catch {
            // ignore rollback errors
          }
        }
        throw storeError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
        failed.push({ email, reason: "Firebase Admin belum dikonfigurasi." });
        continue;
      }
      if (message.includes("FIREBASE_PROJECT_MISMATCH")) {
        failed.push({ email, reason: "Project Firebase Admin tidak cocok." });
      } else {
        failed.push({ email, reason: "Gagal membuat akun." });
      }
    }
  }

  return NextResponse.json({ created, linked, failed }, { status: 200 });
}
