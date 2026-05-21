// ============================================================================
// hydrate-client.tsx — Server → Client TanStack Query cache handoff
// ============================================================================
// Server component wrapper. Server pe pre-filled QueryClient ko dehydrate
// karke client tak bhejta hai — pages with prefetch use this around their
// suspense tree so `useSuspenseQuery` reads from hydrated cache (no waterfall).
//
// Industry pattern (Netflix/Vercel/Linear) — equivalent of tRPC's `HydrateClient`
// but plain TanStack Query (no tRPC dependency).
// ============================================================================

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "./query-client";

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
