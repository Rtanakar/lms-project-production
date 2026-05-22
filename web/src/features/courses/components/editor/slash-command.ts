// ============================================================================
// slash-command.ts — TipTap extension: `/` opens the slash-command menu
// ============================================================================
// Wraps `@tiptap/suggestion` + renders the SlashCommandMenu React component
// via TipTap's `ReactRenderer`. Caret position from suggestion's `clientRect`
// is forwarded to the menu for portal positioning. Arrow / Enter / Escape
// keys are intercepted via `onKeyDown` to keep editing flow uninterrupted.
//
// Configure once on the editor with `uploadHandlers` so media items can
// trigger file pickers from the host component.
// ============================================================================

import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import {
  filterSlashItems,
  getSlashCommandItems,
  type SlashCommandContext,
  type SlashCommandItem,
} from "./slash-command-items";
import {
  SlashCommandMenu,
  type SlashCommandMenuHandle,
} from "./slash-command-menu";

// ============================================================================
// Options + storage typing
// ============================================================================
interface SlashCommandOptions {
  /** Host-provided callbacks (file pickers etc.). Required at runtime. */
  context: SlashCommandContext;
}

declare module "@tiptap/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Storage {}
}

// ============================================================================
// Extension
// ============================================================================
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      context: {
        uploadHandlers: {
          image: () => {},
          video: () => {},
          file: () => {},
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: "/",
        // Don't match if caret is in code block / inline code
        allowSpaces: false,
        startOfLine: false,

        items: ({ query }) =>
          filterSlashItems(
            getSlashCommandItems(this.options.context),
            query,
          ).slice(0, 20),

        // What runs when an item is chosen (Enter or click)
        command: ({ editor, range, props }) => {
          const item = props as SlashCommandItem;
          item.action(editor, range);
        },

        // ReactRenderer wiring — show menu on start, update on query, kill on exit
        render: () => {
          let component: ReactRenderer<
            SlashCommandMenuHandle,
            React.ComponentProps<typeof SlashCommandMenu>
          > | null = null;

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => props.command(item),
                  clientRect: props.clientRect ?? null,
                },
                editor: props.editor,
              });
            },

            onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => props.command(item),
                clientRect: props.clientRect ?? null,
              });
            },

            onKeyDown: (props): boolean => {
              if (props.event.key === "Escape") {
                component?.destroy();
                component = null;
                return true;
              }
              // Forward arrows / Enter to the menu via imperative ref
              return component?.ref?.onKeyDown(props.event) ?? false;
            },

            onExit: () => {
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});
