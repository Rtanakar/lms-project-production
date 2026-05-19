// ============================================================================
// query-provider.tsx — TanStack Query provider with SSR support
// ============================================================================
// "use client" — must, kyunki QueryClientProvider browser-side context hai.
// Next.js 16 me providers exactly aise hi pattern follow karte hain.
//
// ReactQueryDevtools sirf dev me load hota hai (tree-shake in prod).
// ============================================================================

"use client";

import {
  QueryClientProvider,
  type QueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { getQueryClient } from "@/lib/query-client";
import type { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState ensures: ek hi QueryClient instance component lifecycle me
  // (re-renders pe naya client nahi banta — cache preserve)
  const [queryClient] = useState<QueryClient>(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev-only devtools — prod bundle se tree-shake ho jaata hai */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
