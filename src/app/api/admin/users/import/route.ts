import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/api";
import { isRole, type Role } from "@/lib/auth/roles";
import { createAuthUser } from "@/lib/firebase/authRest";
import { createUserRecord } from "@/lib/users/store";

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
      const authUser = await createAuthUser(email, tempPassword);
      await createUserRecord({
        email,
        name,
        jobPosition,
        siteId,
        phone,
        role,
        status: "active",
        authUid: authUser.uid,
      });
      created.push({ email, tempPassword });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
        failed.push({ email, reason: "Firebase Admin belum dikonfigurasi." });
        continue;
      }
      if (message === "EMAIL_EXISTS") {
        failed.push({ email, reason: "Email sudah terdaftar." });
      } else {
        failed.push({ email, reason: "Gagal membuat akun." });
      }
    }
  }

  return NextResponse.json({ created, failed }, { status: 200 });
}
