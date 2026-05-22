// ============================================================================
// MediaUploader.tsx — Reusable image/video uploader with preview + delete
// ============================================================================
// Used for course cover, thumbnail, and demo video. Encapsulates:
//   - Drag-drop area / click-to-upload
//   - Preview (image thumbnail / video <video> player)
//   - Loading state during upload
//   - Remove button (clears form + visually fades out)
//   - Motion entrance/exit animations
//   - Pre-upload size/MIME validation via `validateFileForKind`
//
// Caller passes form value (URL) + onChange callback. R2 key is internal —
// stored only if needed for cleanup, otherwise the URL is enough since the
// course delete service does `extractR2Keys` against the saved URLs.
// ============================================================================

"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, Loader2, Trash2, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  deleteMedia,
  uploadMedia,
  validateFileForKind,
  type UploadKind,
} from "@/lib/upload-media";

// ============================================================================
// Props
// ============================================================================
interface MediaUploaderProps {
  /** Current value (R2 public URL) — stored in form. Empty string = none. */
  value: string;
  /** Called with new URL on upload, or empty string on remove. */
  onChange: (url: string) => void;
  /** Upload kind — determines size/MIME limits + R2 folder. */
  kind: UploadKind;
  /** Visual variant — image (cover/thumb) vs video (demo). */
  variant?: "image" | "video";
  /** Helper text below the dropzone. */
  hint?: string;
  /** Aspect ratio override (e.g. "aspect-video", "aspect-square"). */
  aspect?: string;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================
export function MediaUploader({
  value,
  onChange,
  kind,
  variant = "image",
  hint,
  aspect = variant === "video" ? "aspect-video" : "aspect-[16/9]",
  disabled,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    const err = validateFileForKind(file, kind);
    if (err) {
      toast.error(err);
      return;
    }

    setUploading(true);
    const label = variant === "video" ? "Video" : "Image";

    // `toast.promise` swaps a single toast row through loading → success/error.
    // We tee the promise so our `finally` can still flip `uploading` state.
    const p = uploadMedia(file, kind);
    toast.promise(p, {
      loading: `Uploading ${file.name}…`,
      success: () => `${label} uploaded`,
      error: (err) => (err instanceof Error ? err.message : "Upload failed"),
    });

    try {
      const result = await p;
      onChange(result.url);
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setUploading(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking same file
    if (file) void handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const accept = variant === "video" ? "video/*" : "image/*";

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait" initial={false}>
        {value ? (
          // ─── Preview state ───
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-[rgba(255,90,31,0.15)] bg-black/40",
              aspect,
            )}
          >
            {variant === "video" ? (
              <video
                src={value}
                controls
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            )}

            {/* Remove button — also wipes R2 object */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading || removing}
              onClick={async () => {
                const prevUrl = value;
                if (!prevUrl) return;
                setRemoving(true);
                const label = variant === "video" ? "Video" : "Image";

                // Same teed-promise pattern as upload — single toast row
                // walks through loading → success/error. Form clears either
                // way so the user is never stuck behind a cleanup failure
                // (backend's `extractR2Keys` retries on course hard-delete).
                const p = deleteMedia(prevUrl);
                toast.promise(p, {
                  loading: `Removing ${label.toLowerCase()}…`,
                  success: () => `${label} removed`,
                  error: (err) =>
                    err instanceof Error ? err.message : "Remove failed",
                });

                try {
                  await p;
                } catch (err) {
                  console.warn("[MediaUploader] R2 delete failed:", err);
                } finally {
                  onChange("");
                  setRemoving(false);
                }
              }}
              className="absolute right-3 top-3 gap-1.5 border-rose-500/40 bg-black/60 text-rose-300 backdrop-blur hover:bg-rose-500/10"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {removing ? "Removing…" : "Remove"}
            </Button>
          </motion.div>
        ) : (
          // ─── Dropzone state ───
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition-colors",
              aspect,
              "border-[rgba(255,90,31,0.25)] bg-[rgba(15,10,7,0.4)] hover:border-[rgba(255,90,31,0.5)] hover:bg-[rgba(255,90,31,0.04)]",
              dragOver && "border-[#FF5A1F] bg-[rgba(255,90,31,0.08)]",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </span>
            ) : (
              <>
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[rgba(255,90,31,0.1)] text-[#FFB07A]">
                  {variant === "video" ? (
                    <VideoIcon className="size-5" />
                  ) : (
                    <ImagePlus className="size-5" />
                  )}
                </div>
                <p className="text-sm text-white/80">
                  Click to upload or drag & drop
                </p>
                {hint && (
                  <p className="mt-1 text-xs text-white/45">{hint}</p>
                )}
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={onPick}
              disabled={disabled}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
