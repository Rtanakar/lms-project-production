// ============================================================================
// block-handle.tsx — Left-margin drag affordance (Notion-style)
// ============================================================================
// Wraps `@tiptap/extension-drag-handle-react`'s `DragHandle` component, which
// auto-positions next to the currently-hovered / focused block. Provides:
//   - Drag dots (⋮⋮) — grab to reorder
//   - "+ Add block" button — inserts an empty paragraph BELOW the current
//     block and opens the slash menu via programmatic `/` insertion
//   - Fades in on hover (group/editor) — keeps content reading uncluttered
//
// Mount this near `<EditorContent>` inside the editor host. DragHandle reads
// the editor instance from props and listens to ProseMirror for the current
// node range.
// ============================================================================

"use client";

import { useState } from "react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Editor } from "@tiptap/core";
import { motion, AnimatePresence } from "motion/react";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockHandleProps {
  editor: Editor | null;
}

export function BlockHandle({ editor }: BlockHandleProps) {
  const [hovered, setHovered] = useState(false);

  if (!editor) return null;

  // ─── + Add block — inserts paragraph below current node + opens slash ───
  // Strategy:
  //   1. Find pos AFTER current top-level node (so insertion lands on a new line)
  //   2. Insert empty paragraph containing "/" → suggestion plugin auto-fires
  //   3. Place caret right after the "/" so the slash menu opens immediately
  //
  // pos math: $from.after(1) returns the position right after the depth-1
  // ancestor (the current block). Inside the new paragraph, the "/" sits at
  // pos+1 (paragraph open) → caret at pos+2 lands right after the slash.
  const onAddBlock = () => {
    const { $from } = editor.state.selection;
    const pos = $from.after(1);

    editor
      .chain()
      .focus()
      .insertContentAt(pos, {
        type: "paragraph",
        content: [{ type: "text", text: "/" }],
      })
      .setTextSelection(pos + 2)
      .run();
  };

  return (
    // DragHandle in v3 auto-positions next to the hovered/focused node — no
    // `pixelsToTheLeftOfNode` prop. Use CSS (margin / transform) on the
    // wrapper if a different offset is needed.
    <DragHandle editor={editor}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="-ml-8 flex items-center gap-0.5 select-none"
      >
        {/* ─── + Add block button ─── */}
        <button
          type="button"
          onClick={onAddBlock}
          title="Click to add block below"
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-md text-white/45 transition-colors",
            "hover:bg-[rgba(255,90,31,0.12)] hover:text-[#FFB07A]",
          )}
        >
          <Plus className="size-4" />
        </button>

        {/* ─── Drag handle (⋮⋮) ─── */}
        <button
          type="button"
          title="Drag to reorder"
          className={cn(
            "inline-flex size-6 cursor-grab items-center justify-center rounded-md text-white/45 transition-colors",
            "hover:bg-white/5 hover:text-white/80 active:cursor-grabbing",
          )}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Optional drag-state pill — subtle visual feedback */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none ml-1 hidden whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/55 backdrop-blur md:inline-block"
            >
              Drag
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DragHandle>
  );
}
