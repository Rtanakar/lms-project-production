// ============================================================================
// CreateCourseView.tsx — `/dashboard/courses/new` (4-export composition)
// ============================================================================
// Industry pattern (Netflix/Linear/Vercel admin forms) — server page composes:
//
//   <CreateCourseContainer>      ← chrome (back link + title)
//     <ErrorBoundary FallbackComponent={CreateCourseError}>
//       <CreateCourseContent />  ← form (RHF + Zod + TipTap + uploads)
//     </ErrorBoundary>
//   </CreateCourseContainer>
//
// `CreateCourseLoading` provided for skeleton swap during route transitions.
// ============================================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  BookText,
  Calendar as CalendarLucide,
  CalendarIcon,
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
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Form } from "@/components/ui/form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCourseSchema,
  type CreateCourseInput,
  type CreateCourseFormInput,
  courseStatuses,
  courseStatusLabels,
  courseLevels,
  courseLevelLabels,
  slugify,
} from "../validators/course-validator";
import { useCreateCourse } from "../api/use-courses";
import { CourseDescriptionEditor } from "./CourseDescriptionEditor";
import { MediaUploader } from "./MediaUploader";
import { TagListInput } from "./TagListInput";

// ============================================================================
// Container — chrome (back link, header, scroll area)
// ============================================================================
export function CreateCourseContainer({
  children,
}: {
  children: React.ReactNode;
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
            New course
          </h1>
        </div>
        <p className="mt-1 ml-3 text-sm text-white/55">
          Fill in the details below. Required: title only — everything else can
          be edited later.
        </p>
      </div>

      {children}
    </div>
  );
}

// ============================================================================
// Loading — skeleton swap during route transitions
// ============================================================================
export function CreateCourseLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero section skeleton */}
      <Skeleton className="h-32 w-full rounded-xl bg-[rgba(255,90,31,0.08)]" />

      {/* Section skeletons — basic, media, pricing, schedule */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-32 bg-[rgba(255,90,31,0.08)]" />
          <Skeleton className="h-40 w-full rounded-xl bg-[rgba(255,90,31,0.08)]" />
        </div>
      ))}

      {/* TipTap editor skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 bg-[rgba(255,90,31,0.08)]" />
        <div className="space-y-2 rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(15,10,7,0.4)] p-4">
          <div className="flex gap-2 border-b border-[rgba(255,90,31,0.1)] pb-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="size-8 rounded-md bg-[rgba(255,90,31,0.08)]"
              />
            ))}
          </div>
          <Skeleton className="h-4 w-full bg-[rgba(255,90,31,0.08)]" />
          <Skeleton className="h-4 w-[90%] bg-[rgba(255,90,31,0.08)]" />
          <Skeleton className="h-4 w-[75%] bg-[rgba(255,90,31,0.08)]" />
        </div>
      </div>

      {/* Action row skeleton */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-md bg-[rgba(255,90,31,0.08)]" />
        <Skeleton className="h-10 w-32 rounded-md bg-[rgba(255,90,31,0.08)]" />
      </div>
    </div>
  );
}

// ============================================================================
// Error — retry / back to list
// ============================================================================
export function CreateCourseError({
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
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-white/55">
              {error?.message ?? "Failed to load the create-course form."}
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
// Content — actual form (RHF + Zod)
// ============================================================================
export function CreateCourseContent() {
  const router = useRouter();
  const { mutate: createCourse, isPending } = useCreateCourse();

  // ─── useForm 3-generic — fixes Zod input/output mismatch with .default() ───
  // <FormInput, Context, ResolverOutput>
  //   FormInput  → what RHF holds (defaults still optional)
  //   Output     → what resolver returns to submit handler (defaults filled)
  const form = useForm<CreateCourseFormInput, unknown, CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
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

  const { control, setValue } = form;

  // ─── Auto-generate slug from title (until user touches slug) ───
  const title = useWatch({ control, name: "title" }) ?? "";
  const slugDirty = form.formState.dirtyFields.slug;

  useEffect(() => {
    if (!slugDirty) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, slugDirty, setValue]);

  // ─── Submit ───
  const onSubmit = (data: CreateCourseInput) => {
    createCourse(data, {
      onSuccess: (course) => {
        router.push(`/dashboard/courses/${course.slug}/edit`);
      },
    });
  };

  // ─── Watched values via `useWatch` (employee pattern — scoped re-renders) ───
  // `watch()` from form.watch re-renders the entire component on every change.
  // `useWatch({ control, name })` only re-renders consumers of that specific
  // field — better perf for large forms with many fields.
  const tags = useWatch({ control, name: "tags" }) ?? [];
  const whatYouLearn = useWatch({ control, name: "whatYouLearn" }) ?? [];
  const prerequisites = useWatch({ control, name: "prerequisites" }) ?? [];
  const includes = useWatch({ control, name: "includes" }) ?? [];
  const coverImageUrl = useWatch({ control, name: "coverImageUrl" }) ?? "";
  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" }) ?? "";
  const demoVideoUrl = useWatch({ control, name: "demoVideoUrl" }) ?? "";
  const slug = useWatch({ control, name: "slug" }) ?? "";

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

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <TextInput
                name="slug"
                label="Slug"
                placeholder="auto-generated-from-title"
                control={control}
                disabled={isPending}
                hint={
                  slug
                    ? `Public URL: /courses/${slug}`
                    : "Will use title's slugified form"
                }
              />
            </div>

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
                  hint="JPG/PNG/WebP · up to 5MB · 16:9 recommended"
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
                  hint="JPG/PNG/WebP · up to 2MB · square"
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

          {/* ─── Section: Description (TipTap) ─── */}
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
                    placeholder="Tell students what this course is about. Use the toolbar to add headings, lists, images, and videos."
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
                hint="For showing discounts (must be ≥ price)"
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
          <SectionCard icon={CalendarLucide} title="Schedule">
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
                placeholder="e.g. Server components, RSC patterns, hydration"
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
                placeholder="e.g. 12 hours video, certificate, lifetime access"
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
                    placeholder="Shown below the title in search results (max 160 chars)"
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
                ? "Unsaved changes"
                : "Ready when you are"}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => router.push("/dashboard/courses")}
                className="text-white/70 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
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
                {isPending ? "Creating…" : "Create course"}
              </Button>
            </div>
          </motion.div>
        </FieldGroup>
      </form>
    </Form>
  );
}

// ============================================================================
// Reusable section card — branded chrome around each form group
// ============================================================================
export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <Icon className="size-4 text-[#FFB07A]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ============================================================================
// Reusable inputs (typed to CreateCourseInput field paths)
// ============================================================================
export function TextInput({
  name,
  label,
  placeholder,
  hint,
  control,
  disabled,
}: {
  name: FieldPath<CreateCourseFormInput>;
  label: string;
  placeholder?: string;
  hint?: string;
  control: Control<CreateCourseFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
            {label}
          </FieldLabel>
          <Input
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={(field.value as string | undefined) ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white placeholder:text-white/40 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25"
          />
          {hint && !fieldState.invalid && (
            <p className="text-[11px] text-white/40">{hint}</p>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function NumberInput({
  name,
  label,
  placeholder,
  hint,
  control,
  disabled,
}: {
  name: FieldPath<CreateCourseFormInput>;
  label: string;
  placeholder?: string;
  hint?: string;
  control: Control<CreateCourseFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Coerce form value to a string-safe HTML input value
        const raw = field.value as number | null | undefined;
        const inputValue: number | string = raw ?? "";

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
              {label}
            </FieldLabel>
            <Input
              type="number"
              min={0}
              step={1}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={inputValue}
              onChange={(e) => {
                const v = e.target.value;
                field.onChange(v === "" ? undefined : parseInt(v, 10) || 0);
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white placeholder:text-white/40 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25"
            />
            {hint && !fieldState.invalid && (
              <p className="text-[11px] text-white/40">{hint}</p>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export function SelectInput<T extends string>({
  name,
  label,
  placeholder,
  options,
  labels,
  control,
  disabled,
}: {
  name: FieldPath<CreateCourseFormInput>;
  label: string;
  placeholder: string;
  options: readonly T[];
  labels: Record<T, string>;
  control: Control<CreateCourseFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
            {label}
          </FieldLabel>
          <Select
            value={(field.value as string | undefined) ?? undefined}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              disabled={disabled}
              className="border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {labels[opt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

// ============================================================================
// DateInput — popover + Calendar (industry pattern — Linear/Stripe admin)
// ============================================================================
// RHF stores Date|null|undefined directly (Zod `z.coerce.date()` already
// accepts Date objects). The Calendar component drives selection; the trigger
// shows "dd MMM yyyy" (e.g. "22 May 2026") for a branded LMS feel.
//
// Why not native <input type="date">?
//   - Inconsistent across browsers (Safari renders differently)
//   - No theming control (light popup on dark UI)
//   - No min/max month dropdown
// ============================================================================
export function DateInput({
  name,
  label,
  placeholder = "Pick a date",
  control,
  disabled,
}: {
  name: FieldPath<CreateCourseFormInput>;
  label: string;
  placeholder?: string;
  control: Control<CreateCourseFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        // Delegated to a real component so we can use `useState` for the
        // controlled popover (auto-close on pick).
        <DateInputField
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          invalid={fieldState.invalid}
          error={fieldState.error}
          value={field.value as Date | string | null | undefined}
          onChange={field.onChange}
        />
      )}
    />
  );
}

// ─── Inner field — owns the popover-open state ─────────────────────────────
function DateInputField({
  label,
  placeholder,
  disabled,
  invalid,
  error,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  disabled?: boolean;
  invalid: boolean;
  error: unknown;
  value: Date | string | null | undefined;
  onChange: (next: Date | null) => void;
}) {
  // Controlled popover — without this, picking a date doesn't close the
  // popover (shadcn `Popover` only auto-closes on outside-click or Escape).
  // Industry standard (Linear, Notion, Stripe) closes the moment a date is
  // committed. We keep it open when the user explicitly "Clear date"s so
  // they can immediately pick again without re-clicking the trigger.
  const [open, setOpen] = useState(false);

  // Normalize value to a Date (or undefined for the calendar's `selected`).
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" && value
        ? new Date(value)
        : undefined;
  const validDate = date && !isNaN(date.getTime()) ? date : undefined;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel className="text-xs uppercase tracking-wider text-white/55">
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={[
              "w-full justify-start text-left font-normal",
              "border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white",
              "hover:border-[#FF5A1F] hover:bg-[rgba(15,10,7,0.7)] hover:text-white",
              !validDate && "text-white/40",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CalendarIcon className="mr-2 size-4 text-[#FFB07A]" />
            {validDate ? format(validDate, "dd MMM yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.95)] p-0 backdrop-blur"
          align="start"
        >
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={(d) => {
              onChange(d ?? null);
              // Auto-close on pick. Don't close on null (Calendar fires
              // `onSelect(undefined)` when user clicks the same day twice
              // to clear it — staying open lets them pick again).
              if (d) setOpen(false);
            }}
            defaultMonth={validDate}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2050, 11)}
          />
          {validDate && (
            <div className="border-t border-[rgba(255,90,31,0.15)] p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full text-xs text-white/60 hover:bg-rose-500/10 hover:text-rose-300"
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {invalid && (
        <FieldError
          errors={
            error
              ? ([error] as NonNullable<
                  Parameters<typeof FieldError>[0]
                >["errors"])
              : []
          }
        />
      )}
    </Field>
  );
}
