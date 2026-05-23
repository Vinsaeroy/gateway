"use client";

import { SessionProvider } from "next-auth/react";
import { TranslateSafeBoundary } from "@/components/error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TranslateSafeBoundary>
        {children}
      </TranslateSafeBoundary>
    </SessionProvider>
  );
}
