// ============================================================================
// PasswordResetEmail.tsx — Password reset request template
// ============================================================================

import { Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout.js";
import { EmailButton } from "./EmailButton.js";
import { emailTheme as t } from "./theme.js";

interface PasswordResetEmailProps {
  user: { name: string; email: string };
  url: string;
}

export function PasswordResetEmail({ user, url }: PasswordResetEmailProps) {
  const firstName = user.name.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview={`${firstName}, reset your LMS password`}>
      <Section style={iconWrap}>
        <Text style={iconBadge}>⚿</Text>
      </Section>

      <Heading style={heading}>Reset your password</Heading>

      <Text style={greeting}>Hi {firstName},</Text>
      <Text style={body}>
        We received a request to reset the password for your LMS account.
        Click the button below to choose a new password.
      </Text>

      <EmailButton
        href={url}
        label="Reset Password"
        variant="primary"
        helperText="This link expires in 1 hour."
      />

      <Section style={fallbackBox}>
        <Text style={fallbackTitle}>Trouble with the button?</Text>
        <Text style={fallbackText}>Paste this link in your browser:</Text>
        <Text style={fallbackUrl}>{url}</Text>
      </Section>

      <Section style={alertBox}>
        <Text style={alertText}>
          <strong>Did not request this?</strong> Your password is safe — just
          ignore this email. Consider enabling two-factor authentication for
          extra security.
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

const alertBox = {
  background: "#FFF1EB", // tinted brand alert
  borderRadius: "10px",
  padding: "14px 18px",
  border: `1px solid ${t.border}`,
  margin: "16px 0 28px",
};

const alertText = {
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
