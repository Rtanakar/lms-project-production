// ============================================================================
// AdminCourseSearch.tsx — Search input + filter chips for dashboard
// ============================================================================
// Layout: search box + filter toggle on right → expandable filter panel.
// Active filter count chip on the toggle button.
// ============================================================================

"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
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
import type { CourseStatus, CourseLevel, CourseSort } from "../types";

type StatusValue = CourseStatus | "all";

interface AdminCourseSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  status: StatusValue;
  onStatusChange: (value: StatusValue) => void;
  level: CourseLevel | null;
  onLevelChange: (value: CourseLevel | null) => void;
  sort: CourseSort;
  onSortChange: (value: CourseSort) => void;
  className?: string;
}

export function AdminCourseSearch({
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
  level,
  onLevelChange,
  sort,
  onSortChange,
  className,
}: AdminCourseSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (status !== "all" ? 1 : 0) + (level ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  return (
    <div className={cn("space-y-3", className)}>
      {/* ─── Search + Filter toggle ─── */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] pl-9 pr-9 text-white placeholder:text-white/35 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-white/40 hover:bg-[rgba(255,90,31,0.1)] hover:text-white/80"
                  onClick={() => onSearchChange("")}
                >
                  <X className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "gap-1.5 shrink-0 border-[rgba(255,90,31,0.2)] bg-[rgba(20,12,8,0.55)] text-white/80 hover:bg-[rgba(255,90,31,0.08)] hover:border-[rgba(255,90,31,0.4)]",
            showFilters && "border-[#FF5A1F]/40 bg-[rgba(255,90,31,0.1)]",
          )}
        >
          <Filter className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ─── Filter panel (animated) ─── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.4)] p-3">
              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(v) => onStatusChange(v as StatusValue)}
                >
                  <SelectTrigger className="h-8 w-36 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  <SelectTrigger className="h-8 w-36 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-xs text-white">
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
                  Sort
                </label>
                <Select
                  value={sort}
                  onValueChange={(v) => onSortChange(v as CourseSort)}
                >
                  <SelectTrigger className="h-8 w-36 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="price-asc">Price ↑</SelectItem>
                    <SelectItem value="price-desc">Price ↓</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
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
                    className="h-8 text-xs text-white/60 hover:bg-[rgba(255,90,31,0.08)] hover:text-white"
                    onClick={() => {
                      onStatusChange("all");
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
