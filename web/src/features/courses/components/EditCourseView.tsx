// ============================================================================
// EditCourseView.tsx — `/dashboard/courses/[slug]/edit` (4-export composition)
// ============================================================================
// Mirror of CreateCourseView — same RHF + Zod + section layout, but:
//   1. Fetches existing course via `useCourse(slug)` (cache prefilled by
//      server prefetch → no loading flash on first paint).
//   2. Maps `CourseListItem` → form values (null → "", ISO date → Date).
//   3. Resets the form once data lands (so RHF dirtyFields work correctly).
//   4. Submits via `useUpdateCourse(slug)` as PATCH — payload-clean strips
//      empty strings to `undefined` so backend treats them as "no change".
//   5. If the slug changes during edit, redirects to the new slug URL on
//      success so the URL stays in sync with the resource.
//
// Same 4-export shape so server page composes:
//   <EditCourseContainer>
//     <HydrateClient>
//       <ErrorBoundary FallbackComponent={EditCourseError}>
//         <EditCourseContent slug={slug} />
//       </ErrorBoundary>
//     </HydrateClient>
//   </EditCourseContainer>
//
// `EditCourseLoading` exported for skeleton swap during route transitions.
// ============================================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  BookText,
  Calendar,
  Globe2,
  Image as ImageIcon,
  Loader2,
  PackageOpen,
  RotateCcw,
  Save,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/components/ui/form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  createCourseSchema,
  type CreateCourseInput,
  type CreateCourseFormInput,
  type UpdateCourseInput,
  courseStatuses,
  courseStatusLabels,
  courseLevels,
  courseLevelLabels,
  slugify,
} from "../validators/course-validator";
import { useCourse, useUpdateCourse } from "../api/use-courses";
import type { CourseListItem } from "../types";
import { CourseDescriptionEditor } from "./CourseDescriptionEditor";
import { MediaUploader } from "./MediaUploader";
import { TagListInput } from "./TagListInput";
import {
  DateInput,
  NumberInput,
  SectionCard,
  SelectInput,
  TextInput,
} from "./CreateCourseView";

// ============================================================================
// Container — chrome (back link, header)
// ============================================================================
export function EditCourseContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  /** Optional title hint — shown if available before data loads. */
  title?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 lg:p-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="-ml-2 text-white/65 hover:bg-[rgba(255,90,31,0.08)] hover:text-white"
      >
        <Link href="/dashboard/courses" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Courses
        </Link>
      </Button>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-1 rounded-full bg-[#FF5A1F]" />
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title ? `Edit · ${title}` : "Edit course"}
          </h1>
        </div>
        <p className="mt-1 ml-3 text-sm text-white/55">
          Changes save as a PATCH — only fields you touch get sent to the
          server. Empty fields are left unchanged.
        </p>
      </div>

      {children}
    </div>
  );
}

// ============================================================================
// Loading — skeleton swap during route transitions / first paint
// ============================================================================
// Mirrors the section structure of <EditCourseContent> so layout doesn't shift
// when real data lands. Netflix/Vercel pattern — skeletons match final DOM.
// ============================================================================
export function EditCourseLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Basic info section — title + slug + subtitle + status/level row */}
      <SkeletonSection rows={4} />
      {/* Media — cover + thumb (grid) + demo video */}
      <SkeletonSection mediaGrid />
      {/* Description — short text + tiptap toolbar + body */}
      <SkeletonSection editor />
      {/* Pricing — 3-col row */}
      <SkeletonSection cols={3} rows={1} />
      {/* Schedule — 3 dates + 2 durations */}
      <SkeletonSection cols={3} rows={2} />
      {/* Tags + learn lists */}
      <SkeletonSection rows={4} />
      {/* SEO */}
      <SkeletonSection rows={2} />

      {/* Sticky action bar skeleton */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.6)] px-4 py-3 backdrop-blur">
        <Skeleton className="h-4 w-40 bg-[rgba(255,90,31,0.08)]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md bg-[rgba(255,90,31,0.08)]" />
          <Skeleton className="h-10 w-36 rounded-md bg-[rgba(255,90,31,0.08)]" />
        </div>
      </div>
    </div>
  );
}

// ─── Small helper: skeleton card matching <SectionCard> chrome ───
function SkeletonSection({
  rows = 2,
  cols = 1,
  editor,
  mediaGrid,
}: {
  rows?: number;
  cols?: number;
  editor?: boolean;
  mediaGrid?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)] p-5">
      {/* Section header */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="size-4 rounded bg-[rgba(255,90,31,0.12)]" />
        <Skeleton className="h-4 w-32 bg-[rgba(255,90,31,0.12)]" />
      </div>

      {mediaGrid ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="aspect-video w-full rounded-xl bg-[rgba(255,90,31,0.08)]" />
            <Skeleton className="aspect-square w-full rounded-xl bg-[rgba(255,90,31,0.08)]" />
          </div>
          <Skeleton className="aspect-video w-full rounded-xl bg-[rgba(255,90,31,0.08)]" />
        </div>
      ) : editor ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-md bg-[rgba(255,90,31,0.08)]" />
          <div className="space-y-2 rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(15,10,7,0.4)] p-3">
            <div className="flex gap-1.5 border-b border-[rgba(255,90,31,0.08)] pb-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="size-8 rounded-md bg-[rgba(255,90,31,0.08)]"
                />
              ))}
            </div>
            <Skeleton className="h-3 w-full bg-[rgba(255,90,31,0.08)]" />
            <Skeleton className="h-3 w-[92%] bg-[rgba(255,90,31,0.08)]" />
            <Skeleton className="h-3 w-[78%] bg-[rgba(255,90,31,0.08)]" />
            <Skeleton className="h-3 w-[60%] bg-[rgba(255,90,31,0.08)]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className={
                cols === 1
                  ? ""
                  : cols === 2
                    ? "grid gap-4 sm:grid-cols-2"
                    : "grid gap-4 sm:grid-cols-3"
              }
            >
              {cols === 1 ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-[rgba(255,90,31,0.08)]" />
                  <Skeleton className="h-10 w-full rounded-md bg-[rgba(255,90,31,0.08)]" />
                </div>
              ) : (
                Array.from({ length: cols }).map((_, c) => (
                  <div key={c} className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-[rgba(255,90,31,0.08)]" />
                    <Skeleton className="h-10 w-full rounded-md bg-[rgba(255,90,31,0.08)]" />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error — retry / back to list
// ============================================================================
export function EditCourseError({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Card className="max-w-md border-rose-500/30 bg-rose-500/5">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-rose-500/15">
            <AlertCircle className="size-7 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              Couldn&apos;t load this course
            </h3>
            <p className="mt-1 text-sm text-white/55">
              {error?.message ??
                "The course may have been deleted or you don't have access."}
            </p>
          </div>
          <div className="flex gap-2">
            {resetErrorBoundary && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetErrorBoundary}
                className="gap-2 border-rose-500/30 hover:bg-rose-500/10"
              >
                <RotateCcw className="size-3.5" />
                Retry
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/courses" className="gap-2">
                <ArrowLeft className="size-3.5" />
                Back to Courses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// courseToFormValues — map API shape → RHF form shape
// ============================================================================
// API returns nulls for absent strings; RHF + native inputs want "".
// Dates come as ISO strings; the <DateInput> handles both Date|string.
// ============================================================================
function courseToFormValues(c: CourseListItem): CreateCourseFormInput {
  return {
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle ?? "",
    descriptionText: c.descriptionText ?? "",
    // Backend stores TipTap HTML as a TEXT column → comes back as plain string
    description: c.description ?? "",
    coverImageUrl: c.coverImageUrl ?? "",
    thumbnailUrl: c.thumbnailUrl ?? "",
    demoVideoUrl: c.demoVideoUrl ?? "",
    ogImageUrl: c.ogImageUrl ?? "",
    status: c.status,
    level: c.level,
    price: c.price,
    originalPrice: c.originalPrice,
    currency: c.currency,
    startDate: c.startDate ? new Date(c.startDate) : null,
    endDate: c.endDate ? new Date(c.endDate) : null,
    enrollmentEndsAt: c.enrollmentEndsAt ? new Date(c.enrollmentEndsAt) : null,
    durationHours: c.durationHours,
    durationWeeks: c.durationWeeks ?? null,
    tags: c.tags ?? [],
    whatYouLearn: c.whatYouLearn ?? [],
    prerequisites: c.prerequisites ?? [],
    includes: c.includes ?? [],
    metaTitle: c.metaTitle ?? "",
    metaDescription: c.metaDescription ?? "",
  };
}

// ============================================================================
// Content — fetches + renders form
// ============================================================================
export function EditCourseContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: course, isLoading, error } = useCourse(slug);
  const { mutate: updateCourse, isPending } = useUpdateCourse(slug);

  // ─── Stable default values (computed once when data lands) ───
  const defaultValues = useMemo<CreateCourseFormInput | undefined>(
    () => (course ? courseToFormValues(course) : undefined),
    [course],
  );

  const form = useForm<CreateCourseFormInput, unknown, CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    // Defer real defaults until data arrives — reset() does the hand-off
    defaultValues: defaultValues ?? {
      title: "",
      slug: "",
      subtitle: "",
      descriptionText: "",
      description: "",
      coverImageUrl: "",
      thumbnailUrl: "",
      demoVideoUrl: "",
      ogImageUrl: "",
      status: "DRAFT",
      level: "BEGINNER",
      price: 0,
      originalPrice: 0,
      currency: "INR",
      durationHours: 0,
      tags: [],
      whatYouLearn: [],
      prerequisites: [],
      includes: [],
      metaTitle: "",
      metaDescription: "",
    },
  });

  const { control, setValue, reset } = form;

  // ─── Once data arrives, reset form with real values ───
  // This wipes any stale defaults + clears dirtyFields so submit can diff.
  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  // ─── Title → slug auto-sync (only if user dirties title AND slug untouched) ───
  const title = useWatch({ control, name: "title" }) ?? "";
  const titleDirty = form.formState.dirtyFields.title;
  const slugDirty = form.formState.dirtyFields.slug;

  useEffect(() => {
    if (titleDirty && !slugDirty) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, titleDirty, slugDirty, setValue]);

  // ─── Submit — PATCH only dirty fields (Netflix/Linear pattern) ───
  // Why dirty-only? Sending the whole form back risks overwriting fields
  // another admin changed mid-edit. PATCH semantics = "merge what I touched."
  // ─────────────────────────────────────────────────────────────────────
  const onSubmit = (data: CreateCourseInput) => {
    if (!course) return;

    const dirty = form.formState.dirtyFields;
    const payload: Record<string, unknown> = {};
    for (const key of Object.keys(dirty) as Array<keyof typeof data>) {
      payload[key] = data[key];
    }

    if (Object.keys(payload).length === 0) {
      // Nothing to send — RHF says nothing changed
      return;
    }

    updateCourse(
      { id: course.id, data: payload as UpdateCourseInput },
      {
        onSuccess: (updated) => {
          // Reset dirty state with the new server-confirmed values
          reset(courseToFormValues(updated));
          // If slug changed, redirect to the new URL
          if (updated.slug !== slug) {
            router.replace(`/dashboard/courses/${updated.slug}/edit`);
          }
        },
      },
    );
  };

  // ─── Watched values (scoped re-renders) ───
  const tags = useWatch({ control, name: "tags" }) ?? [];
  const whatYouLearn = useWatch({ control, name: "whatYouLearn" }) ?? [];
  const prerequisites = useWatch({ control, name: "prerequisites" }) ?? [];
  const includes = useWatch({ control, name: "includes" }) ?? [];
  const coverImageUrl = useWatch({ control, name: "coverImageUrl" }) ?? "";
  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" }) ?? "";
  const demoVideoUrl = useWatch({ control, name: "demoVideoUrl" }) ?? "";
  const slugValue = useWatch({ control, name: "slug" }) ?? "";

  // ─── Loading + error guards ───
  // Server prefetch should make this a cache hit (instant); fallback for
  // direct-nav / cache miss / refetch.
  if (isLoading && !course) return <EditCourseLoading />;
  if (error || !course) {
    return (
      <EditCourseError error={error instanceof Error ? error : undefined} />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          {/* ─── Section: Basic ─── */}
          <SectionCard icon={Sparkles} title="Basic information">
            <TextInput
              name="title"
              label="Title"
              placeholder="e.g. Mastering Next.js 16"
              control={control}
              disabled={isPending}
            />
            <TextInput
              name="slug"
              label="Slug"
              placeholder="auto-generated-from-title"
              control={control}
              disabled={isPending}
              hint={
                slugValue
                  ? `Public URL: /courses/${slugValue}`
                  : "Required — will use title's slugified form"
              }
            />
            <TextInput
              name="subtitle"
              label="Subtitle (optional)"
              placeholder="A one-line teaser shown on cards"
              control={control}
              disabled={isPending}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                name="status"
                label="Status"
                placeholder="Select status"
                options={courseStatuses}
                labels={courseStatusLabels}
                control={control}
                disabled={isPending}
              />
              <SelectInput
                name="level"
                label="Level"
                placeholder="Select level"
                options={courseLevels}
                labels={courseLevelLabels}
                control={control}
                disabled={isPending}
              />
            </div>
          </SectionCard>

          {/* ─── Section: Media ─── */}
          <SectionCard icon={ImageIcon} title="Cover & media">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                  Cover image
                </FieldLabel>
                <MediaUploader
                  value={coverImageUrl}
                  onChange={(url) =>
                    setValue("coverImageUrl", url, { shouldDirty: true })
                  }
                  kind="course-cover"
                  hint="JPG/PNG/WebP · auto-converted to WebP · 16:9"
                  disabled={isPending}
                />
              </div>
              <div>
                <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                  Thumbnail
                </FieldLabel>
                <MediaUploader
                  value={thumbnailUrl}
                  onChange={(url) =>
                    setValue("thumbnailUrl", url, { shouldDirty: true })
                  }
                  kind="course-thumb"
                  hint="JPG/PNG/WebP · auto-converted to WebP · square"
                  aspect="aspect-square"
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                Demo video (optional)
              </FieldLabel>
              <MediaUploader
                value={demoVideoUrl}
                onChange={(url) =>
                  setValue("demoVideoUrl", url, { shouldDirty: true })
                }
                kind="course-demo-video"
                variant="video"
                hint="MP4/WebM · up to 200MB"
                disabled={isPending}
              />
            </div>
          </SectionCard>

          {/* ─── Section: Description ─── */}
          <SectionCard icon={BookText} title="Description">
            <Controller
              name="descriptionText"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
                    Short description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={2}
                    placeholder="One-paragraph summary shown on listing cards (max 5000 chars)."
                    disabled={isPending}
                    className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white placeholder:text-white/40"
                  />
                </Field>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
                    Full description (rich)
                  </FieldLabel>
                  <CourseDescriptionEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isPending}
                    placeholder="Tell students what this course is about."
                  />
                </Field>
              )}
            />
          </SectionCard>

          {/* ─── Section: Pricing ─── */}
          <SectionCard icon={Wallet} title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput
                name="price"
                label="Price (₹)"
                placeholder="0"
                control={control}
                disabled={isPending}
              />
              <NumberInput
                name="originalPrice"
                label="Original price (₹)"
                placeholder="0"
                control={control}
                disabled={isPending}
                hint="Must be ≥ price"
              />
              <TextInput
                name="currency"
                label="Currency"
                placeholder="INR"
                control={control}
                disabled={isPending}
              />
            </div>
          </SectionCard>

          {/* ─── Section: Schedule ─── */}
          <SectionCard icon={Calendar} title="Schedule">
            <div className="grid gap-4 sm:grid-cols-3">
              <DateInput
                name="startDate"
                label="Start date"
                control={control}
                disabled={isPending}
              />
              <DateInput
                name="endDate"
                label="End date"
                control={control}
                disabled={isPending}
              />
              <DateInput
                name="enrollmentEndsAt"
                label="Enrollment closes"
                control={control}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                name="durationHours"
                label="Duration (hours)"
                placeholder="0"
                control={control}
                disabled={isPending}
              />
              <NumberInput
                name="durationWeeks"
                label="Duration (weeks)"
                placeholder="0"
                control={control}
                disabled={isPending}
              />
            </div>
          </SectionCard>

          {/* ─── Section: Tags + learn lists ─── */}
          <SectionCard icon={Tag} title="Tags & learning outcomes">
            <div>
              <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                Tags
              </FieldLabel>
              <TagListInput
                value={tags}
                onChange={(next) =>
                  setValue("tags", next, { shouldDirty: true })
                }
                placeholder="e.g. nextjs, design-systems, motion"
                disabled={isPending}
              />
            </div>
            <div>
              <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                What you&apos;ll learn
              </FieldLabel>
              <TagListInput
                value={whatYouLearn}
                onChange={(next) =>
                  setValue("whatYouLearn", next, { shouldDirty: true })
                }
                placeholder="e.g. Server components, RSC patterns"
                lowercase={false}
                maxLength={200}
                max={30}
                disabled={isPending}
              />
            </div>
            <div>
              <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                Prerequisites
              </FieldLabel>
              <TagListInput
                value={prerequisites}
                onChange={(next) =>
                  setValue("prerequisites", next, { shouldDirty: true })
                }
                placeholder="e.g. Basic React knowledge"
                lowercase={false}
                maxLength={200}
                max={30}
                disabled={isPending}
              />
            </div>
            <div>
              <FieldLabel className="mb-2 block text-xs uppercase tracking-wider text-white/55">
                What&apos;s included
              </FieldLabel>
              <TagListInput
                value={includes}
                onChange={(next) =>
                  setValue("includes", next, { shouldDirty: true })
                }
                placeholder="e.g. 12 hours video, certificate"
                lowercase={false}
                maxLength={200}
                max={30}
                disabled={isPending}
              />
            </div>
          </SectionCard>

          {/* ─── Section: SEO ─── */}
          <SectionCard icon={Globe2} title="SEO (optional)">
            <TextInput
              name="metaTitle"
              label="Meta title"
              placeholder="Shown in search results"
              control={control}
              disabled={isPending}
              hint="Max 70 chars"
            />
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
                    Meta description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={2}
                    maxLength={160}
                    placeholder="Shown below the title in search results"
                    disabled={isPending}
                    className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white placeholder:text-white/40"
                  />
                </Field>
              )}
            />
          </SectionCard>

          {/* ─── Sticky action bar ─── */}
          <motion.div
            initial={false}
            className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.85)] px-4 py-3 backdrop-blur"
          >
            <div className="inline-flex items-center gap-2 text-xs text-white/55">
              <PackageOpen className="size-3.5" />
              {form.formState.isDirty
                ? `Unsaved changes (${Object.keys(form.formState.dirtyFields).length})`
                : "All changes saved"}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending || !form.formState.isDirty}
                onClick={() => reset(courseToFormValues(course))}
                className="text-white/70 hover:bg-white/5"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="gap-2 shadow-lg shadow-[rgba(224,74,18,0.35)]"
                style={{
                  background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
                }}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </motion.div>
        </FieldGroup>
      </form>
    </Form>
  );
}
