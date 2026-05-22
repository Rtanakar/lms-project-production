// ============================================================================
// bubble-menu-content.tsx — Inline toolbar shown on selection
// ============================================================================
// Sits INSIDE `<BubbleMenu editor={editor}>` from `@tiptap/react/menus`. Shows
// up automatically when a text range is selected and disappears on collapse.
//
// Pattern (Notion / Linear / Vercel docs):
//   - Heading dropdown (Text / H1 / H2 / H3)
//   - Bold · Italic · Underline · Strike · Code
//   - Link toggle (prompt-based add/edit)
//   - Color picker swatch row (TextStyle + Color extensions)
//   - Clear formatting
//
// Stateless: reads editor.isActive() for active marks/blocks. Re-renders only
// when the parent BubbleMenu shows it (selection events). No internal state
// except the link-edit input (handled via window.prompt for simplicity).
// ============================================================================

"use client";

import type { Editor } from "@tiptap/core";
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  Palette,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TEXT_COLORS } from "./colors";

interface BubbleMenuContentProps {
  editor: Editor;
}

// ============================================================================
// Small atomic button — used throughout
// ============================================================================
function MenuBtn({
  icon: Icon,
  active,
  onClick,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-sm transition-colors",
        "text-white/75 hover:bg-[rgba(255,90,31,0.1)] hover:text-white",
        active && "bg-[rgba(255,90,31,0.15)] text-[#FFB07A]",
      )}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  );
}

function MenuDivider() {
  return <span className="mx-0.5 h-5 w-px bg-white/10" />;
}

// ============================================================================
// Main bubble content
// ============================================================================
export function BubbleMenuContent({ editor }: BubbleMenuContentProps) {
  // ─── Heading-level label for the dropdown trigger ───
  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
      ? "H2"
      : editor.isActive("heading", { level: 3 })
        ? "H3"
        : "Text";

  // ─── Currently applied text color (matches a swatch by value) ───
  const currentColor = editor.getAttributes("textStyle").color as
    | string
    | undefined;

  // ─── Link toggle (prompt-based — keep bubble lean) ───
  const onToggleLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.96)] p-1 shadow-2xl backdrop-blur">
      {/* ─── Heading dropdown ─── */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Block type"
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-white/75 transition-colors hover:bg-[rgba(255,90,31,0.1)] hover:text-white"
          >
            {headingLabel}
            <ChevronDown className="size-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-44 border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.96)] p-1 text-white backdrop-blur"
        >
          <MenuBtn
            icon={Type}
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Text"
          >
            <span className="ml-1">Text</span>
          </MenuBtn>
          <MenuBtn
            icon={Heading1}
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
          >
            <span className="ml-1">Heading 1</span>
          </MenuBtn>
          <MenuBtn
            icon={Heading2}
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
          >
            <span className="ml-1">Heading 2</span>
          </MenuBtn>
          <MenuBtn
            icon={Heading3}
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
          >
            <span className="ml-1">Heading 3</span>
          </MenuBtn>
        </PopoverContent>
      </Popover>

      <MenuDivider />

      {/* ─── Inline marks ─── */}
      <MenuBtn
        icon={Bold}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      />
      <MenuBtn
        icon={Italic}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      />
      <MenuBtn
        icon={UnderlineIcon}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      />
      <MenuBtn
        icon={Strikethrough}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      />
      <MenuBtn
        icon={Code}
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      />

      <MenuDivider />

      {/* ─── Link ─── */}
      <MenuBtn
        icon={LinkIcon}
        active={editor.isActive("link")}
        onClick={onToggleLink}
        title="Add / edit link"
      />

      {/* ─── Color picker — swatches via TextStyle + Color ─── */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Text color"
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-white/75 transition-colors hover:bg-[rgba(255,90,31,0.1)] hover:text-white",
              currentColor && "text-[#FFB07A]",
            )}
          >
            <Palette className="size-4" />
            <span
              className="size-3 rounded-full border border-white/15"
              style={{ background: currentColor || "transparent" }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-60 border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.96)] p-2 backdrop-blur"
        >
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Text color
          </div>
          <div className="grid grid-cols-6 gap-1">
            {TEXT_COLORS.map((c) => {
              const isActive =
                (currentColor ?? "") === c.value ||
                (!currentColor && c.id === "default");
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => {
                    if (c.value) {
                      editor.chain().focus().setColor(c.value).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                  }}
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-md border transition-all",
                    isActive
                      ? "border-[#FF5A1F]/60 ring-2 ring-[#FF5A1F]/30"
                      : "border-white/10 hover:border-white/30",
                  )}
                  style={{
                    background:
                      c.value ||
                      "repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0 4px,transparent 4px 8px)",
                  }}
                >
                  {isActive && (
                    <Check className="size-3 text-white drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <MenuDivider />

      {/* ─── Clear formatting ─── */}
      <MenuBtn
        icon={Eraser}
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Clear formatting"
      />
    </div>
  );
}
