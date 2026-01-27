import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/api";
import { isRole } from "@/lib/auth/roles";
import { getAdminAuth, initAdminAuth } from "@/lib/firebase/admin";
import {
  deleteUserRecord,
  getUserByAuthUid,
  getUserByEmail,
  getUserById,
  updateUserRecord,
} from "@/lib/users/store";

export const runtime = "nodejs";

type UpdateUserBody = {
  name?: unknown;
  jobPosition?: unknown;
  siteId?: unknown;
  phone?: unknown;
  role?: unknown;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isAuthUserMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  if (code.includes("auth/user-not-found")) return true;
  const message =
    "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes("user-not-found");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: UpdateUserBody;
  try {
    body = (await request.json()) as UpdateUserBody;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const updates: UpdateUserBody = {};
  const name = normalizeText(body.name);
  const jobPosition = normalizeText(body.jobPosition);
  const siteId = normalizeText(body.siteId);
  const phone = normalizeText(body.phone);
  const role = normalizeText(body.role);

  if (name) updates.name = name;
  if (jobPosition) updates.jobPosition = jobPosition;
  if (siteId) updates.siteId = siteId;
  if (phone) updates.phone = phone;
  if (role && isRole(role)) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  try {
    const updated = await updateUserRecord(params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Firebase Admin belum dikonfigurasi." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Gagal memperbarui user." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    let rawId = (params.id ?? "").trim();
    let lookupMode: "id" | "email" | "authUid" | null = null;
    let lookupValue = rawId;

    if (!rawId || rawId === "undefined" || rawId === "null") {
      let body: { email?: unknown; id?: unknown; authUid?: unknown } | null = null;
      try {
        body = (await request.json()) as { email?: unknown; id?: unknown; authUid?: unknown };
      } catch {
        body = null;
      }

      const queryEmail = new URL(request.url).searchParams.get("email")?.trim() ?? "";
      const bodyEmail = normalizeText(body?.email);
      const bodyId = normalizeText(body?.id);
      const bodyAuth = normalizeText(body?.authUid);

      if (bodyEmail || queryEmail) {
        lookupMode = "email";
        lookupValue = bodyEmail || queryEmail;
      } else if (bodyAuth) {
        lookupMode = "authUid";
        lookupValue = bodyAuth;
      } else if (bodyId) {
        lookupMode = "id";
        lookupValue = bodyId;
      } else {
        return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
      }
    } else if (rawId.includes("@")) {
      lookupMode = "email";
      lookupValue = rawId;
    } else {
      lookupMode = "id";
      lookupValue = rawId;
    }

    const existing =
      lookupMode === "email"
        ? await getUserByEmail(lookupValue)
        : lookupMode === "authUid"
          ? await getUserByAuthUid(lookupValue)
          : await getUserById(lookupValue);
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    let authWarning: string | null = null;
    if (existing.role === "superadmin") {
      return NextResponse.json(
        { error: "Akun superadmin tidak bisa dihapus." },
        { status: 403 },
      );
    }

    if (existing.authUid) {
      try {
        await initAdminAuth();
        const auth = getAdminAuth();
        await auth.deleteUser(existing.authUid);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
          return NextResponse.json(
            { error: "Firebase Admin belum dikonfigurasi." },
            { status: 500 },
          );
        }
        if (!isAuthUserMissing(error)) {
          authWarning = "Akun auth tidak bisa dihapus.";
        }
      }
    }

    await deleteUserRecord(existing.id);
    return NextResponse.json({ success: true, warning: authWarning }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Firebase Admin belum dikonfigurasi." },
        { status: 500 },
      );
    }
    const detail = message ? ` (${message})` : "";
    return NextResponse.json(
      { error: `Gagal menghapus user.${detail}` },
      { status: 500 },
    );
  }
}
