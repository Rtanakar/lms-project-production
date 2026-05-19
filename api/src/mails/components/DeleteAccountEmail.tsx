// ============================================================================
// DeleteAccountEmail.tsx — Account deletion confirmation template
// ============================================================================

import { Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout.js";
import { EmailButton } from "./EmailButton.js";
import { emailTheme as t } from "./theme.js";

interface DeleteAccountEmailProps {
  user: { name: string; email: string };
  url: string;
}

export function DeleteAccountEmail({ user, url }: DeleteAccountEmailProps) {
  const firstName = user.name.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview="Confirm account deletion — LMS">
      <Section style={iconWrap}>
        <Text style={iconBadge}>⚠</Text>
      </Section>

      <Heading style={heading}>Confirm account deletion</Heading>

      <Text style={greeting}>Hi {firstName},</Text>
      <Text style={body}>
        We received a request to permanently delete your LMS account. This
        action <strong>cannot be undone</strong> — all your courses, progress,
        certificates, and personal data will be erased.
      </Text>

      <Section style={warningBox}>
        <Text style={warningTitle}>What will be deleted</Text>
        <Text style={warningItem}>• Your profile and login credentials</Text>
        <Text style={warningItem}>• All course enrollments and progress</Text>
        <Text style={warningItem}>• Issued certificates</Text>
        <Text style={warningItemLast}>• Comments, reviews, and activity</Text>
      </Section>

      <EmailButton
        href={url}
        label="Confirm Deletion"
        variant="danger"
        helperText="This link expires in 1 hour."
      />

      <Section style={alertBox}>
        <Text style={alertText}>
          <strong>Did not request this?</strong> Please ignore this email and
          change your password immediately to secure your account.
        </Text>
      </Section>

      <Text style={signoff}>
        Sorry to see you go,
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
  background: "#FDECE7",
  color: t.danger,
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

const warningBox = {
  background: "#FDECE7",
  borderRadius: "12px",
  padding: "18px 22px",
  border: `1px solid #F5C6B7`,
  margin: "20px 0",
};

const warningTitle = {
  color: t.danger,
  fontSize: "13px",
  fontWeight: "700",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const warningItem = {
  color: t.inkSoft,
  fontSize: "14px",
  margin: "0 0 6px",
  lineHeight: "1.5",
};

const warningItemLast = {
  color: t.inkSoft,
  fontSize: "14px",
  margin: "0",
  lineHeight: "1.5",
};

const alertBox = {
  background: t.cream2,
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
