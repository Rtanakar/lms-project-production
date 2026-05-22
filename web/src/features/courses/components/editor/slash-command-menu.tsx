// ============================================================================
// slash-command-menu.tsx — Floating `/` menu (React, portal-rendered)
// ============================================================================
// Rendered by the SlashCommand extension via `ReactRenderer`. The extension
// forwards arrow keys → onKeyDown ref. Click outside / Escape closes (handled
// upstream by exiting suggestion).
//
// Positioning: caret rect (from suggestion's `clientRect()`) → portal'd div
// absolutely positioned. No tippy.js dependency — keeps install lean.
//
// Industry pattern: Notion / Linear / Vercel admin docs editor.
// ============================================================================

"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  groupSlashItems,
  type SlashCommandItem,
} from "./slash-command-items";

// ============================================================================
// Props + ref shape (what SlashCommand extension calls)
// ============================================================================
interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  /** Called on item click or Enter — extension wires actual run() */
  command: (item: SlashCommandItem) => void;
  /** Caret rect (top/left/bottom) for portal positioning */
  clientRect: (() => DOMRect | null) | null;
}

export interface SlashCommandMenuHandle {
  /** Returns true if the key event was handled (suppress further handling). */
  onKeyDown: (event: KeyboardEvent) => boolean;
}

// ============================================================================
// Layout constants — match the visual menu size
// ============================================================================
const MENU_WIDTH = 320;
const MENU_MAX_HEIGHT = 360;
const VIEWPORT_PADDING = 8;

// ============================================================================
// Component
// ============================================================================
export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  SlashCommandMenuProps
>(function SlashCommandMenu({ items, command, clientRect }, ref) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset selection when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  // Position the menu near the caret (below by default, above if no room)
  useLayoutEffect(() => {
    if (!clientRect) return;
    const rect = clientRect();
    if (!rect) return;

    const { innerWidth, innerHeight } = window;
    let top = rect.bottom + 6;
    let left = rect.left;

    // Flip above if not enough room below
    if (top + MENU_MAX_HEIGHT > innerHeight - VIEWPORT_PADDING) {
      top = Math.max(VIEWPORT_PADDING, rect.top - MENU_MAX_HEIGHT - 6);
    }
    // Constrain horizontally
    if (left + MENU_WIDTH > innerWidth - VIEWPORT_PADDING) {
      left = Math.max(VIEWPORT_PADDING, innerWidth - MENU_WIDTH - VIEWPORT_PADDING);
    }
    setCoords({ top, left });
  }, [clientRect, items]);

  // Scroll the active item into view (keyboard nav past visible area)
  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Expose keyboard nav to the extension via ref
  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        setActiveIndex((i) => (i + 1) % Math.max(1, items.length));
        return true;
      }
      if (event.key === "ArrowUp") {
        setActiveIndex(
          (i) => (i - 1 + Math.max(1, items.length)) % Math.max(1, items.length),
        );
        return true;
      }
      if (event.key === "Enter") {
        const item = items[activeIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  // SSR / pre-render guard — createPortal needs document
  if (typeof window === "undefined") return null;

  const grouped = groupSlashItems(items);

  return createPortal(
    <AnimatePresence>
      {coords && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: MENU_WIDTH,
            maxHeight: MENU_MAX_HEIGHT,
            zIndex: 1000,
          }}
          className="overflow-y-auto rounded-xl border border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.96)] p-1 shadow-2xl backdrop-blur"
        >
          {items.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-white/45">
              No matching commands
            </div>
          ) : (
            grouped.map(({ group, items: groupItems }) => (
              <div key={group} className="mb-1 last:mb-0">
                <div className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {group}
                </div>
                {groupItems.map((item) => {
                  // `flatIndex` ties keyboard activeIndex to render order
                  const flatIndex = items.findIndex((it) => it.id === item.id);
                  const isActive = flatIndex === activeIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      data-index={flatIndex}
                      type="button"
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => command(item)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                        isActive
                          ? "bg-[rgba(255,90,31,0.12)] text-white"
                          : "text-white/80 hover:bg-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                          isActive
                            ? "border-[#FF5A1F]/40 bg-[rgba(255,90,31,0.15)] text-[#FFB07A]"
                            : "border-white/10 bg-white/5 text-white/75",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {item.title}
                        </div>
                        <div className="truncate text-[11px] text-white/45">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});
