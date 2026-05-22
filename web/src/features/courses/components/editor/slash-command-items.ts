// ============================================================================
// slash-command-items.ts — Registry of all `/` menu commands
// ============================================================================
// Notion-style pattern. Items are grouped, filterable by query, keyboard-
// navigable, and each carries an `action(editor, range)` callback that
// deletes the trigger range and applies the chosen formatting / inserts a
// block / triggers a file upload.
//
// Upload commands defer to handlers passed via SlashCommand.configure() —
// so the editor host (CourseDescriptionEditor) controls the file-picker
// flow and r2-key tracking. Keeps the items registry free of React state.
// ============================================================================

import type { Editor, Range } from "@tiptap/core";
import {
  CheckSquare,
  Code,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
  Video as VideoIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================
export type SlashCommandGroup =
  | "Basic"
  | "Headings"
  | "Lists"
  | "Media"
  | "Embeds";

export interface SlashCommandItem {
  /** Stable id for React keys + selected-state */
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Lowercased keywords for fuzzy match (in addition to title) */
  keywords: string[];
  group: SlashCommandGroup;
  /** Run when item selected (Enter or click). `range` covers the `/query` text. */
  action: (editor: Editor, range: Range) => void;
}

/** Host-provided callbacks — opens native file pickers etc. */
export interface SlashCommandContext {
  uploadHandlers: {
    image: () => void;
    video: () => void;
    file: () => void;
  };
}

// ============================================================================
// Items factory — built with host context for upload callbacks
// ============================================================================
export function getSlashCommandItems(
  ctx: SlashCommandContext,
): SlashCommandItem[] {
  return [
    // ─── Basic ──────────────────────────────────────────────
    {
      id: "text",
      title: "Text",
      description: "Plain paragraph",
      icon: Type,
      keywords: ["paragraph", "text", "body", "p"],
      group: "Basic",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      id: "divider",
      title: "Divider",
      description: "Horizontal separator line",
      icon: Minus,
      keywords: ["hr", "rule", "line", "separator", "divider"],
      group: "Basic",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      id: "quote",
      title: "Quote",
      description: "Blockquote with brand left-border",
      icon: Quote,
      keywords: ["quote", "blockquote", "cite", ">"],
      group: "Basic",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      id: "code",
      title: "Code block",
      description: "Monospace code with syntax highlighting",
      icon: Code,
      keywords: ["code", "codeblock", "pre", "monospace", "```"],
      group: "Basic",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },

    // ─── Headings ───────────────────────────────────────────
    {
      id: "h1",
      title: "Heading 1",
      description: "Largest section title",
      icon: Heading1,
      keywords: ["heading", "title", "h1", "#"],
      group: "Headings",
      action: (editor, range) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 1 })
          .run(),
    },
    {
      id: "h2",
      title: "Heading 2",
      description: "Section heading",
      icon: Heading2,
      keywords: ["heading", "subtitle", "h2", "##"],
      group: "Headings",
      action: (editor, range) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 2 })
          .run(),
    },
    {
      id: "h3",
      title: "Heading 3",
      description: "Sub-section heading",
      icon: Heading3,
      keywords: ["heading", "h3", "###"],
      group: "Headings",
      action: (editor, range) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 3 })
          .run(),
    },

    // ─── Lists ──────────────────────────────────────────────
    {
      id: "bullet-list",
      title: "Bullet list",
      description: "Disc-bulleted unordered list",
      icon: List,
      keywords: ["list", "bullet", "ul", "unordered", "-"],
      group: "Lists",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      id: "ordered-list",
      title: "Numbered list",
      description: "Ordered 1-2-3 list",
      icon: ListOrdered,
      keywords: ["list", "numbered", "ol", "ordered", "1."],
      group: "Lists",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      id: "task-list",
      title: "To-do list",
      description: "Checkbox-able task list",
      icon: CheckSquare,
      keywords: ["task", "todo", "check", "checkbox", "[]"],
      group: "Lists",
      action: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },

    // ─── Media (uploads) ────────────────────────────────────
    {
      id: "image",
      title: "Image",
      description: "Upload image from your device",
      icon: ImageIcon,
      keywords: ["image", "photo", "picture", "img", "upload"],
      group: "Media",
      action: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        ctx.uploadHandlers.image();
      },
    },
    {
      id: "video",
      title: "Video",
      description: "Upload video file (MP4/WebM)",
      icon: VideoIcon,
      keywords: ["video", "movie", "mp4", "webm", "upload"],
      group: "Media",
      action: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        ctx.uploadHandlers.video();
      },
    },
    {
      id: "file",
      title: "File",
      description: "Upload PDF, doc, or any other file",
      icon: FileText,
      keywords: ["file", "attachment", "pdf", "doc", "upload"],
      group: "Media",
      action: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        ctx.uploadHandlers.file();
      },
    },
  ];
}

// ============================================================================
// Filter helper — case-insensitive title + keyword match
// ============================================================================
export function filterSlashItems(
  items: SlashCommandItem[],
  query: string,
): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((it) => {
    if (it.title.toLowerCase().includes(q)) return true;
    if (it.id.toLowerCase().includes(q)) return true;
    return it.keywords.some((k) => k.toLowerCase().includes(q));
  });
}

// ============================================================================
// Group helper — preserves insertion order within each group
// ============================================================================
export function groupSlashItems(
  items: SlashCommandItem[],
): Array<{ group: SlashCommandGroup; items: SlashCommandItem[] }> {
  const groups = new Map<SlashCommandGroup, SlashCommandItem[]>();
  for (const item of items) {
    const list = groups.get(item.group) ?? [];
    list.push(item);
    groups.set(item.group, list);
  }
  return Array.from(groups, ([group, items]) => ({ group, items }));
}
