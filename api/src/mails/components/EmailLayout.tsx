// ============================================================================
// EmailLayout.tsx — Common email wrapper (header + footer + container)
// ============================================================================
// Saari email templates iss wrapper ke andar render hongi — consistent
// branding, padding, footer. Brand: cream background + orange accents.
// ============================================================================

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailTheme as t, emailFont } from "./theme.js";

interface EmailLayoutProps {
  /** Preview text — inbox me subject ke neeche dikhta hai */
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header — brand mark */}
          <Section style={header}>
            <Text style={brandText}>LMS</Text>
            <Text style={brandTag}>Learn. Build. Grow.</Text>
          </Section>

          {/* Main content slot */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You are receiving this email because you have an account with LMS.
            </Text>
            <Text style={footerMeta}>
              &copy; {new Date().getFullYear()} LMS &middot; All rights reserved
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const body = {
  background: t.cream,
  fontFamily: emailFont,
  margin: "0",
  padding: "40px 16px",
  color: t.ink,
};

const container = {
  background: t.white,
  borderRadius: "16px",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px",
  border: `1px solid ${t.border}`,
  boxShadow: "0 1px 3px rgba(14,10,7,0.04)",
};

const header = {
  borderBottom: `1px solid ${t.border}`,
  paddingBottom: "20px",
  marginBottom: "28px",
};

const brandText = {
  color: t.brand,
  fontSize: "24px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-0.5px",
  lineHeight: "1",
};

const brandTag = {
  color: t.muted,
  fontSize: "12px",
  margin: "4px 0 0",
  fontWeight: "500",
  letterSpacing: "0.3px",
};

const content = { padding: "0" };

const divider = {
  borderColor: t.border,
  borderTop: `1px solid ${t.border}`,
  margin: "32px 0 20px",
};

const footer = { textAlign: "center" as const };

const footerText = {
  color: t.muted,
  fontSize: "12px",
  margin: "4px 0",
  lineHeight: "1.6",
};

const footerMeta = {
  color: t.muted,
  fontSize: "11px",
  margin: "8px 0 0",
  opacity: 0.7,
};
