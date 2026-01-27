"use client";

import { useEffect } from "react";

function isWalletInjectionError(reason: unknown): boolean {
  if (!reason) return false;

  const message =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? reason.message
        : typeof reason === "object" && "message" in reason
          ? String((reason as { message?: unknown }).message ?? "")
          : "";

  const normalized = message.toLowerCase();
  return normalized.includes("ethereum") && normalized.includes("redefine");
}

export default function ClientErrorSuppressor() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isWalletInjectionError(event.message || event.error)) {
        event.preventDefault();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isWalletInjectionError(event.reason)) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
