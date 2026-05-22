// ============================================================================
// editor-toc.tsx — Table of contents sidebar (Notion / GitBook style)
// ============================================================================
// Walks the editor doc for `heading` nodes, renders them as a clickable list.
// Click → ProseMirror sets selection at that position + scrolls editor view
// to it (smooth scroll via element.scrollIntoView).
//
// Indentation reflects heading level (H1 flush, H2 indented, H3 deeper).
// Empty state shown when doc has no headings yet ("Outline appears here").
//
// Updates reactively: subscribes to editor `update` + `selectionUpdate` events
// to refresh both the list AND the active highlight. Cleans up on unmount.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";
import { motion, AnimatePresence } from "motion/react";
import { Hash, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================
interface HeadingItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  pos: number;
}

interface EditorTocProps {
  editor: Editor | null;
  /** Optional title shown above the list */
  title?: string;
  className?: string;
}

// ============================================================================
// Doc walker — extracts headings from editor state
// ============================================================================
function extractHeadings(editor: Editor): HeadingItem[] {
  const items: HeadingItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "heading") return;
    const level = node.attrs.level as number;
    if (level < 1 || level > 3) return;
    const text = node.textContent.trim();
    if (!text) return; // skip empty headings
    items.push({
      id: `heading-${pos}`,
      level: level as 1 | 2 | 3,
      text,
      pos,
    });
  });
  return items;
}

// ============================================================================
// Active heading detection — nearest heading at or before current selection
// ============================================================================
function findActiveHeading(
  headings: HeadingItem[],
  selectionPos: number,
): string | null {
  let activeId: string | null = null;
  for (const h of headings) {
    if (h.pos <= selectionPos) activeId = h.id;
    else break;
  }
  return activeId;
}

// ============================================================================
// Component
// ============================================================================
export function EditorToc({
  editor,
  title = "On this page",
  className,
}: EditorTocProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Subscribe to editor updates — refresh headings + active highlight
  useEffect(() => {
    if (!editor) return;

    const refresh = () => {
      const next = extractHeadings(editor);
      setHeadings(next);
      setActiveId(findActiveHeading(next, editor.state.selection.from));
    };

    refresh(); // initial
    editor.on("update", refresh);
    editor.on("selectionUpdate", refresh);

    return () => {
      editor.off("update", refresh);
      editor.off("selectionUpdate", refresh);
    };
  }, [editor]);

  // ─── Click handler — focus + scroll to heading ───
  const goToHeading = (h: HeadingItem) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setTextSelection(h.pos + 1) // +1 = inside the heading node
      .run();

    // Scroll the rendered DOM into view (ProseMirror's scrollIntoView is
    // sometimes too eager — defer to native smooth scroll on the node DOM)
    const view = editor.view;
    const domNode = view.nodeDOM(h.pos) as HTMLElement | null;
    if (domNode && "scrollIntoView" in domNode) {
      domNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ─── Render ───
  return (
    <aside
      className={cn(
        "w-full rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)] p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/45">
        <ListTree className="size-3.5 text-[#FFB07A]" />
        {title}
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {headings.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-white/35"
          >
            Outline appears here as you add headings.
          </motion.p>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-0.5"
          >
            {headings.map((h) => {
              const isActive = h.id === activeId;
              return (
                <motion.li
                  key={h.id}
                  layout
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    type="button"
                    onClick={() => goToHeading(h)}
                    title={h.text}
                    className={cn(
                      "group/toc flex w-full items-start gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors",
                      "hover:bg-[rgba(255,90,31,0.08)]",
                      isActive
                        ? "bg-[rgba(255,90,31,0.1)] text-[#FFB07A]"
                        : "text-white/70 hover:text-white",
                      h.level === 2 && "pl-5",
                      h.level === 3 && "pl-8",
                    )}
                  >
                    <Hash
                      className={cn(
                        "mt-0.5 shrink-0 transition-colors",
                        h.level === 1 ? "size-3.5" : "size-3",
                        isActive
                          ? "text-[#FFB07A]"
                          : "text-white/30 group-hover/toc:text-white/55",
                      )}
                    />
                    <span className="line-clamp-2 wrap-break-word">{h.text}</span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </aside>
  );
}
