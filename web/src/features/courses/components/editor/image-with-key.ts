// ============================================================================
// image-with-key.ts — TipTap Image extension with `data-r2-key` attribute
// ============================================================================
// Extends the built-in Image extension to track R2 object keys in the DOM.
//
// Why this attribute?
//   On course delete the server runs `extractR2Keys(html)` and bulk-deletes
//   orphaned R2 objects. Without `data-r2-key` we'd need brittle URL parsing
//   to identify our own assets. Single source of truth via DOM attribute.
//
// Usage:
//   editor.chain().focus().setImage({
//     src: "https://r2.../course-content/abc.webp",
//     "data-r2-key": "course-content/abc.webp",
//     alt: "Hero diagram",
//   }).run();
// ============================================================================

import Image from "@tiptap/extension-image";

export const ImageWithKey = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      // R2 object key — written by editor on upload, read by extract-r2-keys
      "data-r2-key": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-r2-key"),
        renderHTML: (attrs) =>
          attrs["data-r2-key"] ? { "data-r2-key": attrs["data-r2-key"] } : {},
      },
    };
  },
}).configure({
  // `tt-image` class hooks into globals.css typography styles
  HTMLAttributes: { class: "tt-image" },
  allowBase64: false,
});
