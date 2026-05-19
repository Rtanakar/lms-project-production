// ============================================================================
// theme.ts — Email-safe brand tokens
// ============================================================================
// Hex colors only — email clients (Outlook, Gmail mobile) properly support
// nahi karte oklch/hsl/lch. Inter + system font stack for max compatibility.
// ============================================================================

/**
 * Email-safe color tokens that mirror the portfolio brand.
 * Keep hex — email clients butcher oklch/hsl.
 */
export const emailTheme = {
  brand: "#FF5A1F",
  brandDark: "#E04A12",
  ink: "#0E0A07",
  inkSoft: "#3A2E22",
  muted: "#6B5B4A",
  cream: "#FFF7EC",
  cream2: "#F7EBD6",
  border: "#E6D6BD",
  white: "#FFFFFF",
  success: "#1F7A3A",
  danger: "#B3321B",
} as const;

export const emailFont =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
