// ============================================================================
// video-node.ts — Custom TipTap Node for video embeds (with React NodeView)
// ============================================================================
// TipTap has no built-in video. This atom block node renders via the
// `video-view.tsx` React component — gives us:
//   - Native HTML5 controls
//   - Remove button on selection (Notion-style)
//   - Aspect-ratio container with rounded corners
//   - `data-r2-key` attribute for cleanup on delete
//
// `atom: true` — single unit, no cursor inside, selectable as a whole.
// `draggable: true` — usable by block-handle (Step D5.3).
// ============================================================================

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VideoView } from "./video-view";

export interface VideoAttributes {
  src: string | null;
  "data-r2-key": string | null;
  poster: string | null;
  contentType: string | null;
}

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      "data-r2-key": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-r2-key"),
      },
      poster: { default: null },
      contentType: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-content-type"),
        renderHTML: (attrs) =>
          attrs.contentType ? { "data-content-type": attrs.contentType } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  // Static HTML output (used when reading saved content / SSR)
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        preload: "metadata",
        class: "tt-video",
      }),
    ];
  },

  // React NodeView — interactive editing UI (remove button, hover affordance)
  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },

  addCommands() {
    return {
      setVideo:
        (attrs: Partial<VideoAttributes>) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },
});

// TypeScript augmentation — `editor.commands.setVideo` typed
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attrs: Partial<VideoAttributes>) => ReturnType;
    };
  }
}
