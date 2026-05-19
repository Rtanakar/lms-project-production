// ============================================================================
// VerificationEmail.tsx — Email address verification template
// ============================================================================

import { Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout.js";
import { EmailButton } from "./EmailButton.js";
import { emailTheme as t } from "./theme.js";

interface VerificationEmailProps {
  user: { name: string; email: string };
  url: string;
}

export function VerificationEmail({ user, url }: VerificationEmailProps) {
  const firstName = user.name.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview={`${firstName}, verify your email to get started`}>
      <Section style={iconWrap}>
        <Text style={iconBadge}>✉</Text>
      </Section>

      <Heading style={heading}>Verify your email</Heading>

      <Text style={greeting}>Hi {firstName},</Text>
      <Text style={body}>
        Thanks for signing up for LMS. Confirm your email address to unlock
        all features and enroll in courses.
      </Text>

      <EmailButton
        href={url}
        label="Verify Email"
        variant="primary"
        helperText="This link expires in 1 hour."
      />

      <Section style={fallbackBox}>
        <Text style={fallbackTitle}>Trouble with the button?</Text>
        <Text style={fallbackText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={fallbackUrl}>{url}</Text>
      </Section>

      <Section style={securityBox}>
        <Text style={securityText}>
          <strong>Security tip:</strong> If you did not create an LMS account,
          you can safely ignore this email.
        </Text>
      </Section>

      <Text style={signoff}>
        Cheers,
        <br />
        <strong style={signoffName}>The LMS Team</strong>
      </Text>
    </EmailLayout>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const iconWrap = { textAlign: "center" as const, marginBottom: "20px" };

const iconBadge = {
  display: "inline-block",
  width: "64px",
  height: "64px",
  lineHeight: "64px",
  borderRadius: "50%",
  background: t.cream2,
  color: t.brand,
  fontSize: "30px",
  margin: "0 auto",
  textAlign: "center" as const,
  border: `1px solid ${t.border}`,
};

const heading = {
  color: t.ink,
  fontSize: "26px",
  fontWeight: "700",
  margin: "0 0 20px",
  lineHeight: "1.3",
  textAlign: "center" as const,
  letterSpacing: "-0.4px",
};

const greeting = {
  color: t.ink,
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const body = {
  color: t.inkSoft,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 4px",
};

const fallbackBox = {
  background: t.cream,
  borderRadius: "10px",
  padding: "16px 20px",
  border: `1px solid ${t.border}`,
  margin: "20px 0",
};

const fallbackTitle = {
  color: t.ink,
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const fallbackText = {
  color: t.muted,
  fontSize: "12px",
  margin: "0 0 8px",
};

const fallbackUrl = {
  color: t.brand,
  fontSize: "12px",
  wordBreak: "break-all" as const,
  margin: "0",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const securityBox = {
  background: t.cream2,
  borderRadius: "10px",
  padding: "14px 18px",
  border: `1px solid ${t.border}`,
  margin: "16px 0 28px",
};

const securityText = {
  color: t.inkSoft,
  fontSize: "13px",
  margin: "0",
  lineHeight: "1.6",
};

const signoff = {
  color: t.inkSoft,
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0",
};

const signoffName = { color: t.ink };
