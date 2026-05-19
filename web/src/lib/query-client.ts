// ============================================================================
// query-client.ts — TanStack QueryClient factory
// ============================================================================
// Centralized config — saare queries ke default behavior yaha define.
// Industry defaults:
//   - staleTime: 60s    → 1 min tak fresh maano, refetch na karo on remount
//   - gcTime: 5 min     → unused queries 5 min me garbage collect
//   - retry: 1          → ek baar retry (network blip)
//   - refetchOnWindowFocus: true (prod) → tab pe wapas aane pe fresh data
// ============================================================================

import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 1 min freshness — bahut frequent refetch nahi
        staleTime: 60 * 1000,
        // 5 min garbage collect window
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
      },
      mutations: {
        retry: 0, // Mutations retry nahi (idempotency assume nahi karte)
      },
      // ===== SSR Hydration with superjson =====
      // Server pe Date/Map/Set serialize karne ke liye superjson use karte hain.
      // Plain JSON.stringify Date ko string banata hai aur client pe Date object
      // wapas nahi banta — superjson type metadata preserve karta hai.
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}

// Browser-side singleton — har remount pe naya client mat banao
// (warna cache reset ho jata hai)
let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: har request pe naya client (no cross-request leak)
    return makeQueryClient();
  }
  // Client: singleton
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}
