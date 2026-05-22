// ============================================================================
// cleanup-extension.ts — auto-delete R2 objects when nodes are removed
// ============================================================================
// Watches every editor transaction. When a node carrying `data-r2-key`
// disappears (delete, cut, replace), the key is collected and handed to
// the host's `onKeysRemoved` callback.
//
// Why a ProseMirror plugin (not editor.on("update"))?
//   - `update` fires AFTER state replacement — but we still have access to
//     both old + new doc via `appendTransaction`, which is the canonical
//     diff hook in ProseMirror.
//   - Lets us batch multiple removals in a single drag-delete.
//   - Doesn't modify the transaction (returns `null`), so undo/redo work.
//
// UX tradeoff (immediate vs deferred delete):
//   We delete IMMEDIATELY. This means Ctrl+Z after removing media will show
//   a broken URL (R2 object is gone). Most editors (Notion, Linear)
//   accept this. To defer: have onKeysRemoved push to a "pending" buffer
//   and flush on form submit.
// ============================================================================

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as PMNode } from "@tiptap/pm/model";

// ============================================================================
// Walk the doc, return Set of all `data-r2-key` values present
// ============================================================================
// Image (mark-attr based — `data-r2-key` on Image node attrs)
// Video (custom node — `data-r2-key` on attrs)
// FileChip (custom inline atom — `data-r2-key` on attrs)
// ============================================================================
function collectR2Keys(doc: PMNode): Set<string> {
  const keys = new Set<string>();
  doc.descendants((node) => {
    const key = node.attrs?.["data-r2-key"];
    if (typeof key === "string" && key) keys.add(key);
  });
  return keys;
}

// ============================================================================
// Options shape
// ============================================================================
interface CleanupExtensionOptions {
  /** Called with the list of keys that vanished after a transaction */
  onKeysRemoved: (keys: string[]) => void;
}

// ============================================================================
// Extension
// ============================================================================
export const CleanupExtension = Extension.create<CleanupExtensionOptions>({
  name: "r2Cleanup",

  addOptions() {
    return {
      onKeysRemoved: () => {},
    };
  },

  addProseMirrorPlugins() {
    // Capture the host callback at plugin-creation time so the plugin's
    // appendTransaction can call it without `this` gymnastics.
    const onKeysRemoved = this.options.onKeysRemoved;

    return [
      new Plugin({
        key: new PluginKey("r2-cleanup"),

        // ProseMirror hook — called after each transaction. We diff the docs
        // and report removed R2 keys. Returning `null` means no transaction
        // modification (history-preserving).
        appendTransaction: (_transactions, oldState, newState) => {
          if (oldState.doc.eq(newState.doc)) return null;

          const oldKeys = collectR2Keys(oldState.doc);
          const newKeys = collectR2Keys(newState.doc);

          // Detect removals: in old, not in new
          const removed: string[] = [];
          for (const k of oldKeys) {
            if (!newKeys.has(k)) removed.push(k);
          }

          if (removed.length > 0) {
            // Defer outside the transaction loop so the callback can dispatch
            // network requests without blocking ProseMirror's commit.
            queueMicrotask(() => onKeysRemoved(removed));
          }

          return null;
        },
      }),
    ];
  },
});
