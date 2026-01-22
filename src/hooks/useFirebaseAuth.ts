"use client";

import { useEffect, useState } from "react";

import { type User } from "firebase/auth";

import { listenAuthState } from "@/lib/firebase/auth";

export type FirebaseAuthState = {
  user: User | null;
  isLoading: boolean;
};

export function useFirebaseAuth(): FirebaseAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isLoading };
}
