// ============================================================================
// PublicCoursesSearch.tsx — search + filter chips for /courses & /my-courses
// ============================================================================
// Mirrors AdminCoursesSearch surface but tuned for the marketing side:
//   • No `status` filter — backend already restricts to public statuses
//     (COMING_SOON / UPCOMING / LIVE / COMPLETED) when no `status` is sent
//   • Pill-shaped search bar (matches the marketing hero aesthetic) instead
//     of the admin's smaller rectangle
//   • Same active-filter badge + clear behaviour
//
// Shared selects (Level, Sort) use the same dropdown UI as the admin so the
// shadcn theme + a11y stays consistent across the app.
// ============================================================================

"use client";

import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CourseLevel, CourseSort } from "../types";

interface PublicCoursesSearchProps {
  searchValue: string;
  onSearchChange: (next: string) => void;
  level: CourseLevel | null;
  onLevelChange: (next: CourseLevel | null) => void;
  sort: CourseSort;
  onSortChange: (next: CourseSort) => void;
  className?: string;
}

export function PublicCoursesSearch({
  searchValue,
  onSearchChange,
  level,
  onLevelChange,
  sort,
  onSortChange,
  className,
}: PublicCoursesSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  // "newest" is the default sort, so don't count it as an active filter
  const activeFilterCount = (level ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  return (
    <div className={cn("space-y-3", className)}>
      {/* ─── Row: pill search + filter toggle ─── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses, topics, instructors…"
            className="h-12 rounded-full border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] pl-12 pr-12 text-base text-white placeholder:text-white/40 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="size-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "h-12 shrink-0 gap-1.5 rounded-full border-[rgba(255,90,31,0.2)] bg-[rgba(20,12,8,0.55)] px-5 text-white/80 hover:border-[rgba(255,90,31,0.45)] hover:bg-[rgba(255,90,31,0.08)] hover:text-white",
            showFilters &&
              "border-[#FF5A1F]/45 bg-[rgba(255,90,31,0.1)] text-white",
          )}
        >
          <Filter className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ─── Filter panel (animated reveal) ─── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.5)] p-4">
              {/* Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Level
                </label>
                <Select
                  value={level ?? "ALL_LEVELS"}
                  onValueChange={(v) =>
                    onLevelChange(
                      v === "ALL_LEVELS" ? null : (v as CourseLevel),
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-40 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_LEVELS">All levels</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Sort by
                </label>
                <Select
                  value={sort}
                  onValueChange={(v) => onSortChange(v as CourseSort)}
                >
                  <SelectTrigger className="h-9 w-40 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="price-asc">Price ↑</SelectItem>
                    <SelectItem value="price-desc">Price ↓</SelectItem>
                    <SelectItem value="popular">Most popular</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-white/60 hover:bg-[rgba(255,90,31,0.08)] hover:text-white"
                    onClick={() => {
                      onLevelChange(null);
                      onSortChange("newest");
                    }}
                  >
                    <X className="mr-1 size-3" />
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
