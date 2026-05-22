// ============================================================================
// editor-toolbar.tsx — Sticky top toolbar
// ============================================================================
// Pattern (Notion / Linear admin docs):
//   - Sits above EditorContent, sticky on scroll
//   - Quick access to history + headings + marks + lists + media uploads
//   - Compact: button group separators with `MenuDivider`
//   - Mirrors the bubble menu's brand language (orange accent on active)
//
// Media upload buttons DELEGATE to host-provided callbacks — the toolbar
// never owns file inputs. Keeps this component pure UI; uploads + R2-key
// tracking stay in CourseDescriptionEditor (Step D5.5).
// ============================================================================

"use client";

import type { Editor } from "@tiptap/core";
import { AnimatePresence, motion } from "motion/react";
import {
  Bold,
  Code,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Video as VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Props
// ============================================================================
interface EditorToolbarProps {
  editor: Editor | null;
  /** Upload status — shows pill at right side of toolbar */
  uploading?: "image" | "video" | "file" | null;
  /** Triggers host's hidden file input */
  onImageUpload: () => void;
  onVideoUpload: () => void;
  onFileUpload: () => void;
  /** Optional link prompt (defaults to window.prompt) */
  onSetLink?: () => void;
  disabled?: boolean;
}

// ============================================================================
// Atomic button
// ============================================================================
function TBtn({
  icon: Icon,
  active,
  onClick,
  disabled,
  title,
  spin,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  spin?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors",
        "text-white/65 hover:bg-[rgba(255,90,31,0.1)] hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-[rgba(255,90,31,0.15)] text-[#FFB07A]",
      )}
    >
      <Icon className={cn("size-4", spin && "animate-spin")} />
    </button>
  );
}

function TDivider() {
  return <span className="mx-0.5 h-5 w-px bg-white/10" />;
}

// ============================================================================
// Component
// ============================================================================
export function EditorToolbar({
  editor,
  uploading = null,
  onImageUpload,
  onVideoUpload,
  onFileUpload,
  onSetLink,
  disabled,
}: EditorToolbarProps) {
  if (!editor) {
    return (
      <div className="h-10 animate-pulse rounded-t-xl border-b border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.6)]" />
    );
  }

  const isDisabled = !!disabled;

  // ─── Link toggle — prompt-based unless host overrides ───
  const handleSetLink =
    onSetLink ??
    (() => {
      const prev = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL", prev ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    });

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.85)] px-2 py-1.5 backdrop-blur">
      {/* ─── History ─── */}
      <TBtn
        icon={Undo2}
        title="Undo (Ctrl+Z)"
        disabled={isDisabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <TBtn
        icon={Redo2}
        title="Redo (Ctrl+Y)"
        disabled={isDisabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />

      <TDivider />

      {/* ─── Headings ─── */}
      <TBtn
        icon={Heading1}
        active={editor.isActive("heading", { level: 1 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      />
      <TBtn
        icon={Heading2}
        active={editor.isActive("heading", { level: 2 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      />
      <TBtn
        icon={Heading3}
        active={editor.isActive("heading", { level: 3 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      />

      <TDivider />

      {/* ─── Inline marks ─── */}
      <TBtn
        icon={Bold}
        active={editor.isActive("bold")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      />
      <TBtn
        icon={Italic}
        active={editor.isActive("italic")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      />
      <TBtn
        icon={UnderlineIcon}
        active={editor.isActive("underline")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      />
      <TBtn
        icon={Strikethrough}
        active={editor.isActive("strike")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      />
      <TBtn
        icon={Code}
        active={editor.isActive("code")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      />

      <TDivider />

      {/* ─── Block formatting ─── */}
      <TBtn
        icon={List}
        active={editor.isActive("bulletList")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      />
      <TBtn
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      />
      <TBtn
        icon={ListChecks}
        active={editor.isActive("taskList")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task list"
      />
      <TBtn
        icon={Quote}
        active={editor.isActive("blockquote")}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      />
      <TBtn
        icon={Minus}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      />

      <TDivider />

      {/* ─── Link ─── */}
      <TBtn
        icon={LinkIcon}
        active={editor.isActive("link")}
        disabled={isDisabled}
        onClick={handleSetLink}
        title="Add / edit link"
      />

      <TDivider />

      {/* ─── Media uploads ─── */}
      <TBtn
        icon={uploading === "image" ? Loader2 : ImageIcon}
        spin={uploading === "image"}
        disabled={isDisabled || uploading !== null}
        onClick={onImageUpload}
        title="Upload image"
      />
      <TBtn
        icon={uploading === "video" ? Loader2 : VideoIcon}
        spin={uploading === "video"}
        disabled={isDisabled || uploading !== null}
        onClick={onVideoUpload}
        title="Upload video"
      />
      <TBtn
        icon={uploading === "file" ? Loader2 : FileText}
        spin={uploading === "file"}
        disabled={isDisabled || uploading !== null}
        onClick={onFileUpload}
        title="Upload file"
      />

      {/* ─── Upload status pill (right-aligned, motion fade-in) ─── */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,90,31,0.12)] px-2.5 py-1 text-[11px] text-[#FFB07A]"
          >
            <Loader2 className="size-3 animate-spin" />
            Uploading {uploading}…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
