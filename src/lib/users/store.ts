import "server-only";

import { randomUUID } from "crypto";

import type { Role } from "@/lib/auth/roles";
import { getAdminFirestore, initAdminFirestore } from "@/lib/firebase/admin";

export type UserStatus = "active" | "inactive";

export type StoredUser = {
  id: string;
  authUid: string | null;
  email: string;
  name: string;
  jobPosition: string;
  siteId: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
};

type FirestoreUser = Omit<StoredUser, "id">;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getUsersCollection() {
  await initAdminFirestore();
  const db = getAdminFirestore();
  return db.collection("users");
}

function mapDoc(id: string, data: FirestoreUser): StoredUser {
  return { ...data, id };
}

export async function listUsers(): Promise<StoredUser[]> {
  const collection = await getUsersCollection();
  const snapshot = await collection.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => mapDoc(doc.id, doc.data() as FirestoreUser));
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const collection = await getUsersCollection();
  const snapshot = await collection.where("email", "==", normalized).limit(1).get();

  const doc = snapshot.docs[0];
  if (!doc) return null;
  return mapDoc(doc.id, doc.data() as FirestoreUser);
}

export async function getUserByAuthUid(authUid: string): Promise<StoredUser | null> {
  const normalized = authUid.trim();
  if (!normalized) return null;

  const collection = await getUsersCollection();
  const snapshot = await collection.where("authUid", "==", normalized).limit(1).get();
  const doc = snapshot.docs[0];
  if (!doc) return null;
  return mapDoc(doc.id, doc.data() as FirestoreUser);
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const collection = await getUsersCollection();
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return mapDoc(doc.id, doc.data() as FirestoreUser);
}

export async function createUserRecord(input: {
  email: string;
  name: string;
  jobPosition: string;
  siteId: string;
  phone: string;
  role: Role;
  status?: UserStatus;
  authUid?: string | null;
}): Promise<StoredUser> {
  const normalizedEmail = normalizeEmail(input.email);
  if (!normalizedEmail) {
    throw new Error("EMAIL_INVALID");
  }

  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const now = Date.now();
  const id = input.authUid ?? randomUUID();
  const user: FirestoreUser = {
    authUid: input.authUid ?? null,
    email: normalizedEmail,
    name: input.name.trim(),
    jobPosition: input.jobPosition.trim(),
    siteId: input.siteId.trim(),
    phone: input.phone.trim(),
    role: input.role,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getUsersCollection();
  await collection.doc(id).set(user);
  return mapDoc(id, user);
}

export async function updateUserRecord(
  id: string,
  updates: Partial<Omit<StoredUser, "id" | "email" | "createdAt">>,
): Promise<StoredUser | null> {
  const collection = await getUsersCollection();
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const existing = doc.data() as FirestoreUser;
  const next: FirestoreUser = {
    ...existing,
    ...updates,
    email: existing.email,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  };

  await docRef.set(next);
  return mapDoc(id, next);
}

export async function deleteUserRecord(id: string): Promise<boolean> {
  const collection = await getUsersCollection();
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;
  await docRef.delete();
  return true;
}
