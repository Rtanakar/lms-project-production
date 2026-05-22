// ============================================================================
// colors.ts — Color palette for text-color picker (Notion-style)
// ============================================================================
// Used by bubble-menu-content.tsx to render swatches. Each entry has a stable
// `id` (for selected-state checks) and the actual CSS value applied via
// TextStyle + Color extensions.
//
// Palette chosen to harmonize with LMS dark theme:
//   - Cream + warm whites = body text variants
//   - Brand orange family = accents
//   - Cool blues/violets/greens/rose = semantic highlights
//
// Tones tuned for readability on `bg-[#0A0807]` background.
// ============================================================================

export interface ColorSwatch {
  id: string;
  label: string;
  /** CSS color — applied via editor.chain().setColor(value) */
  value: string;
}

export const TEXT_COLORS: ColorSwatch[] = [
  { id: "default", label: "Default", value: "" }, // empty = unset
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "cream", label: "Cream", value: "#FFF7EC" },
  { id: "muted", label: "Muted", value: "rgba(255,255,255,0.55)" },
  { id: "orange", label: "Orange", value: "#FF5A1F" },
  { id: "peach", label: "Peach", value: "#FFB07A" },
  { id: "amber", label: "Amber", value: "#FBBF24" },
  { id: "emerald", label: "Emerald", value: "#34D399" },
  { id: "blue", label: "Blue", value: "#60A5FA" },
  { id: "violet", label: "Violet", value: "#A78BFA" },
  { id: "rose", label: "Rose", value: "#FB7185" },
];
