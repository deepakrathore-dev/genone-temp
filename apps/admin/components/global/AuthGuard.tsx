"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/stores/auth.store";

/**
 * Client-side auth gate. Redirects to /login when no session and we're not
 * already on the login route. In production this is handled by middleware +
 * an auth cookie - this is the demo-equivalent.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuth((s) => s.session);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => { setHydrated(true); }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!session && pathname !== "/login") {
      router.replace("/login");
    }
  }, [hydrated, session, pathname, router]);

  if (!hydrated || (!session && pathname !== "/login")) {
    return (
      <div className="min-h-screen grid place-items-center bg-grid">
        <div className="text-sm text-[var(--text-muted)] font-mono">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}
