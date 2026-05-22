// ============================================================================
// AdminCourseTable.tsx — Dashboard courses table with row actions
// ============================================================================
// - Renders course rows with cover thumbnail, title, status badge, price,
//   instructor, stats, and actions menu
// - Loading skeleton, empty state
// - Row hover reveals action button
// ============================================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BookOpen,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDeleteCourse } from "../api/use-courses";
import {
  COURSE_LEVEL_META,
  COURSE_STATUS_META,
  type CourseListItem,
} from "../types";

// ============================================================================
// Currency formatter (INR shorthand)
// ============================================================================
function formatPrice(amount: number, currency: string): string {
  if (currency === "INR") {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

// ============================================================================
// Table header (shared between skeleton + loaded)
// ============================================================================
function TableHeaderRow() {
  return (
    <TableHeader>
      <TableRow className="border-[rgba(255,90,31,0.12)] hover:bg-transparent">
        <TableHead className="text-xs uppercase tracking-wider text-white/55">
          Course
        </TableHead>
        <TableHead className="hidden text-xs uppercase tracking-wider text-white/55 sm:table-cell">
          Status
        </TableHead>
        <TableHead className="hidden text-xs uppercase tracking-wider text-white/55 md:table-cell">
          Level
        </TableHead>
        <TableHead className="hidden text-xs uppercase tracking-wider text-white/55 lg:table-cell">
          Price
        </TableHead>
        <TableHead className="hidden text-xs uppercase tracking-wider text-white/55 lg:table-cell">
          Students
        </TableHead>
        <TableHead className="hidden text-xs uppercase tracking-wider text-white/55 xl:table-cell">
          Updated
        </TableHead>
        <TableHead className="w-12 text-right">
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

// ============================================================================
// Skeleton — matches loaded layout
// ============================================================================
function SkeletonRow() {
  return (
    <TableRow className="border-[rgba(255,90,31,0.08)]">
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-md bg-[rgba(255,90,31,0.08)]" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-40 bg-[rgba(255,90,31,0.08)]" />
            <Skeleton className="h-2.5 w-28 bg-[rgba(255,90,31,0.08)]" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-5 w-16 rounded-full bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-3 w-16 bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-3 w-14 bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-3 w-10 bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <Skeleton className="h-3 w-20 bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto size-8 rounded-md bg-[rgba(255,90,31,0.08)]" />
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Loading state — multiple skeleton rows
// ============================================================================
export function AdminCourseTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)]">
      <Table>
        <TableHeaderRow />
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// Empty state
// ============================================================================
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(255,90,31,0.2)] bg-[rgba(20,12,8,0.3)] py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[rgba(255,90,31,0.1)]">
        <BookOpen className="size-6 text-[#FFB07A]" />
      </div>
      <p className="font-medium text-white/85">
        {hasFilters ? "No courses match your filters" : "No courses yet"}
      </p>
      <p className="mt-1 text-sm text-white/50">
        {hasFilters
          ? "Try adjusting the search or filters above."
          : "Get started by creating your first course."}
      </p>
    </div>
  );
}

// ============================================================================
// Row component (with action dropdown + delete dialog)
// ============================================================================
function CourseRow({ course }: { course: CourseListItem }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteCourse();

  const statusMeta = COURSE_STATUS_META[course.status];
  const levelMeta = COURSE_LEVEL_META[course.level];

  return (
    <>
      <motion.tr
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="group border-b border-[rgba(255,90,31,0.08)] transition-colors hover:bg-[rgba(255,90,31,0.04)]"
      >
        {/* Course (cover + title + slug) */}
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-[rgba(255,90,31,0.12)] bg-[rgba(255,90,31,0.05)]">
              {course.coverImageUrl ? (
                <Image
                  src={course.coverImageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="size-5 text-white/30" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/dashboard/courses/${course.id}`}
                className="block max-w-[24rem] truncate text-sm font-medium text-white/90 transition-colors hover:text-[#FFB07A]"
              >
                {course.title}
              </Link>
              <p className="mt-0.5 max-w-[24rem] truncate font-mono text-[11px] text-white/45">
                /{course.slug}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Status badge */}
        <TableCell className="hidden sm:table-cell">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium", statusMeta.tone)}
          >
            {statusMeta.label}
          </Badge>
        </TableCell>

        {/* Level */}
        <TableCell className="hidden md:table-cell">
          <span className="text-xs text-white/65">{levelMeta.label}</span>
        </TableCell>

        {/* Price */}
        <TableCell className="hidden lg:table-cell">
          <div className="flex flex-col">
            <span className="text-xs font-semibold tabular-nums text-white/90">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.discountPercent > 0 && (
              <span className="text-[10px] text-emerald-400">
                {course.discountPercent}% off
              </span>
            )}
          </div>
        </TableCell>

        {/* Students + rating */}
        <TableCell className="hidden lg:table-cell">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs tabular-nums text-white/65">
              <Users className="size-3 text-white/40" />
              {course.studentsEnrolled.toLocaleString()}
            </span>
            {course.rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-amber-400">
                <Star className="size-3 fill-amber-400" />
                {course.rating.toFixed(1)}
              </span>
            )}
          </div>
        </TableCell>

        {/* Updated */}
        <TableCell className="hidden xl:table-cell">
          <span className="font-mono text-[11px] text-white/50">
            {format(new Date(course.updatedAt), "dd MMM yyyy")}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 transition-opacity hover:bg-[rgba(255,90,31,0.1)] group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="size-4 text-white/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/courses/${course.slug}`} className="gap-2">
                  <Eye className="size-3.5" />
                  View public
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/courses/${course.slug}/edit`}
                  className="gap-2"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </motion.tr>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{course.title}</span> will be
              permanently deleted along with all its modules and FAQs. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="gap-2 bg-rose-600 text-white hover:bg-rose-700"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                // AlertDialogAction closes the dialog by default; let it.
                // We start the mutation and wrap it in a toast.promise so
                // the user sees "Deleting…" → "Course deleted" or the
                // server's error message in a single toast row.
                e.preventDefault();
                const p = deleteMutation.mutateAsync(course.id);
                toast.promise(p, {
                  loading: `Deleting "${course.title}"…`,
                  success: "Course deleted permanently",
                  error: (err) =>
                    err instanceof Error ? err.message : "Failed to delete",
                });
                // Close the dialog immediately — feedback lives in the toast.
                p.finally(() => setDeleteOpen(false));
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================================
// Main table component
// ============================================================================
interface AdminCourseTableProps {
  items: CourseListItem[];
  isFetching?: boolean;
  hasFilters: boolean;
}

export function AdminCourseTable({
  items,
  isFetching,
  hasFilters,
}: AdminCourseTableProps) {
  if (items.length === 0) return <EmptyState hasFilters={hasFilters} />;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)] transition-opacity duration-200",
        isFetching && "opacity-60",
      )}
    >
      <Table>
        <TableHeaderRow />
        <TableBody>
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
