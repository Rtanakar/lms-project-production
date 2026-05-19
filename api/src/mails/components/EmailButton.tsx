// ============================================================================
// EmailButton.tsx — Reusable CTA button (brand-themed)
// ============================================================================

import { Button, Section, Text } from "@react-email/components";
import { emailTheme as t } from "./theme.js";

interface EmailButtonProps {
  href: string;
  label: string;
  variant?: "primary" | "danger";
  helperText?: string;
}

export function EmailButton({
  href,
  label,
  variant = "primary",
  helperText,
}: EmailButtonProps) {
  const bg = variant === "danger" ? t.danger : t.brand;
  const hoverBg = variant === "danger" ? "#9A2A17" : t.brandDark;

  return (
    <Section style={section}>
      <Button
        href={href}
        style={{
          ...buttonBase,
          background: bg,
          borderColor: hoverBg,
        }}
      >
        {label}
      </Button>
      {helperText && <Text style={helper}>{helperText}</Text>}
    </Section>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const section = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const buttonBase = {
  color: t.white,
  padding: "14px 32px",
  borderRadius: "10px",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "600",
  display: "inline-block",
  borderBottom: "2px solid",
  boxShadow: "0 1px 2px rgba(14,10,7,0.08)",
};

const helper = {
  color: t.muted,
  fontSize: "12px",
  margin: "12px 0 0",
};
