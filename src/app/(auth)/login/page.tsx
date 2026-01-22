import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getRoleRedirectPath } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(getRoleRedirectPath(session.user.role));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-primary-soft blur-3xl" />
        <div className="absolute top-20 -right-24 h-[480px] w-[480px] rounded-full bg-accent-blue/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-accent-cyan/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <LoginForm />
          </div>

          <div className="col-span-12 lg:col-span-7">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 sm:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      Multi-role access
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Dashboard berbeda untuk tiap role
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Unit Manager, Storekeeper, dan Chef punya akses terpisah agar alur kerja lebih rapi.
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-indigo/10 text-accent-indigo">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6V12L16 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-blue/10 text-accent-blue">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 12L11 15L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  Session aman
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Token ditandatangani dan disimpan via HTTP-only cookie.
                </p>
              </div>

              <div className="col-span-12 sm:col-span-5 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-cyan/10 text-accent-cyan">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 2V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 9H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 6H19C20.1046 6 21 6.89543 21 8V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  Siap dikembangkan
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Struktur auth sudah siap untuk dihubungkan ke API/DB.
                </p>
              </div>

              <div className="col-span-12 sm:col-span-7 rounded-[28px] border border-border bg-surface p-7 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      Tips
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Masuk pakai akun Firebase
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Gunakan email dan password yang terdaftar di Firebase Authentication.
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 18H12.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.29 8.71C10.6826 8.3175 11.2151 8.09704 11.7704 8.09704C12.3257 8.09704 12.8582 8.3175 13.2508 8.71C13.6433 9.1025 13.8638 9.63501 13.8638 10.1903C13.8638 10.7456 13.6433 11.2781 13.2508 11.6706C12.9732 11.9482 12.6467 12.1051 12.35 12.3178C12.0533 12.5305 12 12.75 12 13.25V14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
