"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@genone/ui";
import * as React from "react";
import { AuthGuard } from "@/components/global/AuthGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="genone-admin-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={150}>
          <AuthGuard>{children}</AuthGuard>
        </TooltipProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
