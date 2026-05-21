// ============================================================================
// StatCards.tsx — Top stats row (Kravio-style)
// ============================================================================
// Generic — pass `stats: StatCardItem[]`. Animated count-up + trend arrow.
// ============================================================================

"use client";

import { motion } from "motion/react";
import {
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  PlaySquare,
  type LucideIcon,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Icon string → component map — Client side pe resolve hoga
export const ICON_MAP = {
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  PlaySquare,
} as const;

export type IconName = keyof typeof ICON_MAP;

export interface StatCardItem {
  label: string;
  value: number | string;
  delta?: number; // % change vs previous period
  deltaLabel?: string; // "vs last week"
  icon: IconName;
  accent?: "orange" | "emerald" | "blue" | "rose";
  format?: (v: number | string) => string;
}

const ACCENTS = {
  orange: {
    iconBg: "bg-[rgba(255,90,31,0.12)]",
    iconColor: "text-[#FFB07A]",
    border: "border-l-[#FF5A1F]",
  },
  emerald: {
    iconBg: "bg-emerald-500/12",
    iconColor: "text-emerald-400",
    border: "border-l-emerald-500",
  },
  blue: {
    iconBg: "bg-blue-500/12",
    iconColor: "text-blue-400",
    border: "border-l-blue-500",
  },
  rose: {
    iconBg: "bg-rose-500/12",
    iconColor: "text-rose-400",
    border: "border-l-rose-500",
  },
} as const;

export function StatCards({ stats }: { stats: StatCardItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  accent = "orange",
  format,
  index,
}: StatCardItem & { index: number }) {
  const a = ACCENTS[accent];
  const isPositive = (delta ?? 0) >= 0;
  const displayValue = format ? format(value) : String(value);
  const Icon: LucideIcon = ICON_MAP[icon]; // ✅ Client side pe resolve

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-l-4 border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] p-5 backdrop-blur",
        "transition-shadow hover:shadow-[0_8px_30px_rgba(224,74,18,0.1)]",
        a.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
            {label}
          </p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-white">
            {displayValue}
          </p>
          {delta !== undefined && (
            <p
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium",
                isPositive ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {isPositive ? "+" : ""}
              {delta}%
              {deltaLabel && (
                <span className="ml-1 text-white/45">{deltaLabel}</span>
              )}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            a.iconBg,
          )}
        >
          <Icon className={cn("size-4.5", a.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
