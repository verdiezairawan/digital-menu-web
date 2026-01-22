import "client-only";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  type User,
  type UserCredential,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

export function listenAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(firebaseAuth);
}
