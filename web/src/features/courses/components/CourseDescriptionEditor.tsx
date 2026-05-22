// ============================================================================
// CourseDescriptionEditor.tsx — Notion-grade rich editor for course details
// ============================================================================
// Composes the `editor/` folder pieces:
//   - StarterKit (+ built-in Link/Underline) + Placeholder + TaskList/Item
//   - TextStyle + Color (text-color swatch in bubble menu)
//   - ImageWithKey + VideoNode (with React NodeView) + FileChipNode
//   - SlashCommand (`/` opens menu with uploads + formatting)
//   - EditorToolbar (sticky top)
//   - BlockHandle (left-margin drag + add-block)
//   - BubbleMenu → BubbleMenuContent (selection toolbar + color picker)
//   - EditorToc (right sidebar, heading anchors)
//
// File uploads delegated to host's hidden inputs. R2 presigned upload via
// `uploadMedia`. Successful upload → editor command inserts node with the
// `data-r2-key` attribute for cleanup on delete.
//
// NOT memoized — toolbar reads `editor.isActive(...)` on every render to show
// active states. Memoizing froze those readings. Re-rendering is cheap here
// because `useEditor` returns a stable instance + ProseMirror owns its DOM
// (React only reconciles the wrapper).
// ============================================================================

"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
// TipTap v3: TextStyle + Color use NAMED exports (default export removed)
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  deleteMediaBulk,
  uploadMedia,
  validateFileForKind,
  type UploadKind,
} from "@/lib/upload-media";
import { ImageWithKey } from "./editor/image-with-key";
import { VideoNode } from "./editor/video-node";
import { FileChipNode } from "./editor/file-chip-node";
import { SlashCommand } from "./editor/slash-command";
import { CleanupExtension } from "./editor/cleanup-extension";
import { EditorToolbar } from "./editor/editor-toolbar";
import { BlockHandle } from "./editor/block-handle";
import { BubbleMenuContent } from "./editor/bubble-menu-content";
import { EditorToc } from "./editor/editor-toc";

// ============================================================================
// Props
// ============================================================================
interface CourseDescriptionEditorProps {
  /** Initial HTML content (only used on first mount) */
  value: string;
  /** Fires on every doc change with current HTML */
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Show TOC sidebar on lg+ screens (default: true) */
  showToc?: boolean;
}

// ============================================================================
// Module-level upload-handler registry (per editor instance via WeakMap)
// ============================================================================
// React Compiler flags inline `() => ref.current?.click()` closures inside
// extension configure() as "ref access during render". The fix: store handler
// references in a module-level mediator, populate via useEffect (post-render),
// and have SlashCommand call into the mediator via stable functions captured
// at editor creation time. No ref-in-render warnings; no fragile useCallback.
// ============================================================================
type UploadHandlers = {
  image: () => void;
  video: () => void;
  file: () => void;
};
const NOOP_HANDLERS: UploadHandlers = {
  image: () => {},
  video: () => {},
  file: () => {},
};

// ============================================================================
// Main component
// ============================================================================
export function CourseDescriptionEditor({
  value,
  onChange,
  disabled,
  placeholder = "Type / for commands · drag the handle to reorder blocks",
  showToc = true,
}: CourseDescriptionEditorProps) {
  // ─── Hidden file inputs (image / video / file) ───
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "video" | "file" | null>(
    null,
  );

  // ─── Restore guard ────────────────────────────────────────────────────────
  // `setContent()` (used by the external-value-sync effect below) clears the
  // doc and re-parses HTML in two ProseMirror transactions. The CleanupExt
  // sees the intermediate "doc was wiped" step and would otherwise call
  // deleteMediaBulk for every existing key — which is what causes a phantom
  // "2 items removed" toast right after a successful PATCH (form reset).
  //
  // We flip this ref to `true` for the duration of a programmatic restore.
  // The CleanupExtension's onKeysRemoved closure reads `.current` and skips
  // the cleanup when set. The flag clears on the next microtask, which runs
  // AFTER the cleanup extension's own microtask (FIFO ordering), so any
  // genuine user-driven removal in the very next tick still cleans up.
  const isRestoringRef = useRef(false);

  // ─── Mutable handlers registry (populated in useEffect — never in render) ─
  const handlersRef = useRef<UploadHandlers>(NOOP_HANDLERS);

  useEffect(() => {
    // Populate AFTER render so the compiler never sees ref reads at render time
    handlersRef.current = {
      image: () => imageInputRef.current?.click(),
      video: () => videoInputRef.current?.click(),
      file: () => fileInputRef.current?.click(),
    };
    return () => {
      handlersRef.current = NOOP_HANDLERS;
    };
  }, []);

  // ─── Editor instance — stable (created once) ───
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "tt-link" },
        },
        codeBlock: { HTMLAttributes: { class: "tt-code-block" } },
        blockquote: { HTMLAttributes: { class: "tt-blockquote" } },
        bulletList: { HTMLAttributes: { class: "tt-bullet-list" } },
        orderedList: { HTMLAttributes: { class: "tt-ordered-list" } },
      }),
      Placeholder.configure({ placeholder, includeChildren: true }),
      TaskList.configure({ HTMLAttributes: { class: "tt-task-list" } }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "tt-task-item" },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      ImageWithKey,
      VideoNode,
      FileChipNode,
      // SlashCommand receives functions that defer to the mediator ref.
      // These closures are created once at editor creation; .current is only
      // read when the user clicks a slash item (post-mount, post-render).
      // eslint-disable-next-line react-hooks/refs
      SlashCommand.configure({
        context: {
          uploadHandlers: {
            image: () => handlersRef.current.image(),
            video: () => handlersRef.current.video(),
            file: () => handlersRef.current.file(),
          },
        },
      }),
      // ─── R2 auto-cleanup — delete from storage when nodes are removed ──
      // Hooks into every transaction, diffs old vs new doc for
      // `data-r2-key` attributes, fires DELETE for each removed key.
      //
      // Toast UX: most removals here are user-initiated (clicked the Remove
      // button on a node, or Backspace on a selected atom block). We wrap
      // the cleanup in toast.promise so the user gets the same loading →
      // success row they see for uploads. Failures still log to console.
      CleanupExtension.configure({
        onKeysRemoved: (keys) => {
          // Skip during programmatic content restores (form reset after save,
          // edit-page hydration). Otherwise the "doc clear" step in
          // `setContent` would phantom-toast "N items removed" even though
          // the same keys reappear in the next transaction.
          if (isRestoringRef.current) return;

          const p = deleteMediaBulk(keys);
          toast.promise(p, {
            loading:
              keys.length === 1
                ? "Removing from storage…"
                : `Removing ${keys.length} items from storage…`,
            success: () =>
              keys.length === 1 ? "Removed" : `${keys.length} items removed`,
            error: (err) =>
              err instanceof Error ? err.message : "Cleanup failed",
          });
          p.catch((err) => {
            console.warn("[editor] R2 cleanup failed:", err);
          });
        },
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false, // SSR safety
    editorProps: {
      attributes: {
        class: cn(
          "tt-editor ProseMirror prose prose-invert max-w-none px-6 py-5",
          "focus:outline-none min-h-[320px]",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // ─── External value sync (THE async-data fix) ────────────────────────────
  // `useEditor({ content: value })` reads `content` only ONCE on mount.
  // In the edit-course flow the form `reset()` lands AFTER mount (data is
  // fetched), so the editor stays empty even though RHF has the HTML.
  //
  // Strategy: when `value` prop changes AND differs from the editor's current
  // HTML, push it into the editor with `emitUpdate: false` so we don't kick
  // off a feedback loop (onUpdate → onChange → parent re-render → effect…).
  // Empty-string normalization: TipTap returns "<p></p>" for an empty doc, so
  // treat both "" and "<p></p>" as equivalent.
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? "";
    const current = editor.getHTML();
    const normalize = (s: string) => (s === "<p></p>" ? "" : s);
    if (normalize(incoming) !== normalize(current)) {
      // Mute the R2 cleanup hook while we swap content programmatically.
      // setContent runs two transactions (clear → insert); without this flag
      // the clear step would fire deleteMediaBulk for every key that's
      // about to immediately come back.
      isRestoringRef.current = true;
      editor.commands.setContent(incoming, { emitUpdate: false });
      // Reset on the next microtask. CleanupExtension defers its callback
      // via queueMicrotask too, but the one IT scheduled (inside the
      // synchronous setContent above) is FIFO-ordered before this one — so
      // by the time we set false, the callback has already early-returned.
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });
    }
  }, [editor, value]);

  // ─── Generic file-upload handler ───────────────────────────────────────
  // UX pattern (sonner promise toast — Linear / Vercel / Notion):
  //   1. toast.loading("Uploading <name>…")  — single persistent toast row
  //   2. On success → that same toast row swaps to a success state with the
  //      filename + size (no flashing two separate toasts).
  //   3. On failure → swaps to error with the reason.
  // `toast.promise` handles all three states from one promise — no manual
  // dismiss/replace needed.
  // ─────────────────────────────────────────────────────────────────────────
  const handleUpload = async (
    file: File,
    kind: UploadKind,
    channel: "image" | "video" | "file",
  ) => {
    const err = validateFileForKind(file, kind);
    if (err) {
      toast.error(err);
      return;
    }
    setUploading(channel);

    // Pretty size for the success toast (e.g. "2.4 MB")
    const fmtSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const kindLabel =
      channel === "image" ? "Image" : channel === "video" ? "Video" : "File";

    const insert = async () => {
      const result = await uploadMedia(file, kind);
      if (!editor) throw new Error("Editor unmounted");

      if (channel === "image") {
        editor
          .chain()
          .focus()
          .setImage({
            src: result.url,
            // @ts-expect-error — ImageWithKey extension adds data-r2-key attr
            "data-r2-key": result.key,
            alt: file.name,
          })
          .run();
      } else if (channel === "video") {
        editor
          .chain()
          .focus()
          .setVideo({
            src: result.url,
            "data-r2-key": result.key,
            contentType: result.contentType,
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setFileChip({
            href: result.url,
            "data-r2-key": result.key,
            filename: file.name,
            sizeBytes: result.size,
          })
          .run();
      }
      return result;
    };

    // sonner's `toast.promise` returns the toast id, not a thenable — so we
    // tee the promise: hand it to the toast for UI, await it separately for
    // our own `finally` block.
    const promise = insert();
    toast.promise(promise, {
      loading: `Uploading ${file.name}…`,
      success: (result) =>
        `${kindLabel} inserted · ${fmtSize(result.size || file.size)}`,
      error: (err) => (err instanceof Error ? err.message : "Upload failed"),
    });
    try {
      await promise;
    } catch {
      // toast.promise already surfaced the error to the user
    } finally {
      setUploading(null);
    }
  };

  const onImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleUpload(file, "course-content-image", "image");
  };

  const onVideoPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    // NOTE: backend uses `course-demo-video` for any video upload right now.
    if (file) void handleUpload(file, "course-demo-video", "video");
  };

  const onFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleUpload(file, "course-content-file", "file");
  };

  // ─── Loading shell while editor mounts ───
  if (!editor) {
    return (
      <div className="min-h-90 animate-pulse rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(15,10,7,0.4)]" />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        showToc && "lg:grid-cols-[1fr_220px]",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      {/* ─── Editor column ─── */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.4)] focus-within:border-[rgba(255,90,31,0.4)] transition-colors">
        <EditorToolbar
          editor={editor}
          uploading={uploading}
          onImageUpload={() => imageInputRef.current?.click()}
          onVideoUpload={() => videoInputRef.current?.click()}
          onFileUpload={() => fileInputRef.current?.click()}
          disabled={disabled}
        />

        <EditorContent editor={editor} />

        <BlockHandle editor={editor} />

        <BubbleMenu editor={editor} className="z-30">
          <BubbleMenuContent editor={editor} />
        </BubbleMenu>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImagePick}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onVideoPick}
        />
        <input
          ref={fileInputRef}
          type="file"
          // Mirror the backend allowlist so the OS picker doesn't tease users
          // with files we'd reject. Order: pdf → office → archive → plaintext.
          accept={[
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/zip",
            "application/json",
            "text/plain",
            "text/markdown",
            "text/csv",
          ].join(",")}
          className="hidden"
          onChange={onFilePick}
        />
      </div>

      {showToc && (
        <EditorToc
          editor={editor}
          className="hidden lg:block lg:sticky lg:top-4 lg:self-start"
        />
      )}
    </div>
  );
}
