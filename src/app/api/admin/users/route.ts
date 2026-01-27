import { NextRequest, NextResponse } from "next/server";

import { requireRoleFromRequest, getSessionFromRequest } from "@/lib/auth/api";
import { isRole, type Role } from "@/lib/auth/roles";
import { createAuthUser } from "@/lib/firebase/authRest";
import { createUserRecord, listUsers } from "@/lib/users/store";

export const runtime = "nodejs";

type CreateUserBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  jobPosition?: unknown;
  siteId?: unknown;
  phone?: unknown;
  role?: unknown;
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

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Firebase Admin belum dikonfigurasi." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Gagal memuat data user." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = requireRoleFromRequest(request, ["superadmin"]);
  if (!session) {
    const fallback = getSessionFromRequest(request);
    return NextResponse.json(
      { error: fallback ? "Forbidden" : "Unauthorized" },
      { status: fallback ? 403 : 401 },
    );
  }

  let body: CreateUserBody;
  try {
    body = (await request.json()) as CreateUserBody;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const name = normalizeText(body.name);
  const email = normalizeText(body.email).toLowerCase();
  const password = normalizeText(body.password);
  const jobPosition = normalizeText(body.jobPosition);
  const siteId = normalizeText(body.siteId);
  const phone = normalizeText(body.phone);

  if (!name || !email || !password || !jobPosition || !siteId || !phone) {
    return NextResponse.json(
      { error: "Semua field wajib diisi." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter." },
      { status: 400 },
    );
  }

  const roleInput = normalizeText(body.role);
  const role =
    (roleInput && isRole(roleInput) ? roleInput : null) ?? inferRole(jobPosition);
  if (!role) {
    return NextResponse.json(
      { error: "Role belum valid. Isi role atau pastikan job position dikenali." },
      { status: 400 },
    );
  }

  const status = "active";

  try {
    const authUser = await createAuthUser(email, password);
    const user = await createUserRecord({
      email,
      name,
      jobPosition,
      siteId,
      phone,
      role,
      status,
      authUid: authUser.uid,
    });

    return NextResponse.json(
      { user },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Firebase Admin belum dikonfigurasi." },
        { status: 500 },
      );
    }
    if (message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    if (message === "EMAIL_INVALID") {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Gagal membuat akun. Coba lagi." },
      { status: 500 },
    );
  }
}
