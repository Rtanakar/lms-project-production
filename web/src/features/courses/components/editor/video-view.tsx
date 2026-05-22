// ============================================================================
// video-view.tsx — React NodeView for the Video block
// ============================================================================
// Rendered in place of the Video node inside the editor. Provides:
//   - Native <video controls> playback
//   - Remove button overlay (visible on hover or when selected)
//   - Selection ring (matches Notion's block selection)
//   - Motion fade-in on insert
//
// `NodeViewWrapper` is required by TipTap so ProseMirror knows where the
// node's DOM root is. `selected` prop comes from ReactNodeViewRenderer.
// ============================================================================

"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { motion } from "motion/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideoView({ node, selected, deleteNode, editor }: NodeViewProps) {
  const src = node.attrs.src as string | null;
  const contentType = node.attrs.contentType as string | null;
  const isEditable = editor.isEditable;
  const [loadError, setLoadError] = useState(false);

  return (
    <NodeViewWrapper
      as="div"
      // NOTE: `data-drag-handle` removed from the wrapper. Putting it on the
      // whole node makes ProseMirror treat every mousedown — including clicks
      // on the <video> controls — as a drag/atom-select, which kills play/
      // pause/seek. Dragging is now done through the separate BlockHandle UI.
      className={cn(
        "group/video relative my-4 overflow-hidden rounded-xl border bg-black transition-all",
        selected
          ? "border-[#FF5A1F] ring-2 ring-[#FF5A1F]/40"
          : "border-[rgba(255,90,31,0.12)]",
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {src ? (
          // `contentEditable={false}` → ProseMirror does NOT try to own this
          // subtree, so native <video> click/keyboard events reach the
          // element. Without this the editor swallows mousedown to start an
          // atom-block selection, and play/pause feels "disabled".
          <div
            contentEditable={false}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="select-text pointer-events-auto"
          >
            {loadError ? (
              // Surface the real cause — controls would otherwise stay stuck
              // at 0:00 with no hint. 99% of the time this is R2 bucket not
              // public for GET, or CORS not allowing the page's origin.
              <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center">
                <AlertTriangle className="size-6 text-amber-400" />
                <p className="text-sm font-medium text-white/85">
                  Video can&apos;t be loaded from storage
                </p>
                <p className="max-w-md text-xs text-white/55">
                  The file uploaded, but your R2 bucket likely isn&apos;t
                  publicly readable. In Cloudflare → R2 → bucket → Settings:
                  enable <span className="font-mono">Public access</span> (or
                  attach a custom domain), and add a CORS rule allowing
                  <span className="font-mono"> GET, HEAD </span> from this
                  origin.
                </p>
                <p className="max-w-md break-all font-mono text-[10px] text-white/35">
                  {src}
                </p>
              </div>
            ) : (
              <video
                src={src}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                onError={() => setLoadError(true)}
                className="tt-video block w-full"
              >
                {contentType && <source src={src} type={contentType} />}
              </video>
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-white/45">
            Video URL missing
          </div>
        )}
      </motion.div>

      {/* Remove button — visible on hover or selection */}
      {isEditable && (
        <button
          type="button"
          contentEditable={false}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNode();
          }}
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-black/70 px-3 py-1 text-xs text-rose-300 backdrop-blur",
            "opacity-0 transition-opacity hover:bg-rose-500/15 group-hover/video:opacity-100",
            selected && "opacity-100",
          )}
        >
          <Trash2 className="size-3" />
          Remove
        </button>
      )}
    </NodeViewWrapper>
  );
}
