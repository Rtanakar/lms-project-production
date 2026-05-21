// ============================================================================
// use-courses-search.ts — Debounced search input hook
// ============================================================================
// Pattern: type fast in UI → wait 400ms idle → push to URL state → trigger
// new query. Clearing is instant (no debounce — user sees results immediately).
//
// External changes (e.g., filter reset) sync back into local state.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { PAGINATION } from "@/config/constants";

interface UseCoursesSearchConfig<T extends { search: string; page: number }> {
  params: T;
  setParams: (params: Partial<T>) => void;
  debounceMs?: number;
}

export function useCoursesSearch<T extends { search: string; page: number }>({
  params,
  setParams,
  debounceMs = 400,
}: UseCoursesSearchConfig<T>) {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    // Clearing is instant (no debounce)
    if (localSearch === "" && params.search !== "") {
      setParams({
        search: "",
        page: PAGINATION.DEFAULT_PAGE,
      } as Partial<T>);
      return;
    }

    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE, // Reset to page 1 on new search
        } as Partial<T>);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params.search, setParams, debounceMs]);

  // Sync external changes (e.g., "Clear filters" button)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearch(params.search);
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
}
