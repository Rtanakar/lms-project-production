// ============================================================================
// WelcomeEmail.tsx — Onboarding welcome template
// ============================================================================

import { Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout.js";
import { EmailButton } from "./EmailButton.js";
import { emailTheme as t } from "./theme.js";
import { env } from "../../config/env.js";

interface WelcomeEmailProps {
  user: { name: string; email: string };
}

export function WelcomeEmail({ user }: WelcomeEmailProps) {
  const firstName = user.name.split(" ")[0] ?? "there";
  const dashboardUrl = `${env.CORS_ORIGIN}/dashboard`;

  return (
    <EmailLayout preview={`Welcome to LMS, ${firstName} — let's get started`}>
      <Section style={iconWrap}>
        <Text style={iconBadge}>✦</Text>
      </Section>

      <Heading style={heading}>Welcome to LMS</Heading>

      <Text style={greeting}>Hi {firstName},</Text>
      <Text style={body}>
        Your account is ready. Dive into courses, track your progress, and
        learn at your own pace. Here is what you can do right away:
      </Text>

      <Section style={featureBox}>
        <Text style={featureItem}>
          <span style={featureBullet}>›</span> Browse hundreds of courses
        </Text>
        <Text style={featureItem}>
          <span style={featureBullet}>›</span> Track lesson progress &amp; streaks
        </Text>
        <Text style={featureItem}>
          <span style={featureBullet}>›</span> Earn certificates on completion
        </Text>
        <Text style={featureItemLast}>
          <span style={featureBullet}>›</span> Join the learner community
        </Text>
      </Section>

      <EmailButton
        href={dashboardUrl}
        label="Go to Dashboard"
        variant="primary"
      />

      <Text style={tipText}>
        Tip: Verify your email from the dashboard banner to unlock
        certificates and course enrollment.
      </Text>

      <Text style={signoff}>
        Happy learning,
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
  background: t.brand,
  color: t.white,
  fontSize: "28px",
  margin: "0 auto",
  textAlign: "center" as const,
  border: `1px solid ${t.brandDark}`,
};

const heading = {
  color: t.ink,
  fontSize: "28px",
  fontWeight: "800",
  margin: "0 0 20px",
  lineHeight: "1.3",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
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

const featureBox = {
  background: t.cream,
  borderRadius: "12px",
  padding: "20px 24px",
  border: `1px solid ${t.border}`,
  margin: "20px 0 8px",
};

const featureBullet = {
  color: t.brand,
  fontWeight: "700",
  marginRight: "10px",
};

const featureItem = {
  color: t.inkSoft,
  fontSize: "14px",
  margin: "0 0 10px",
  lineHeight: "1.5",
};

const featureItemLast = {
  color: t.inkSoft,
  fontSize: "14px",
  margin: "0",
  lineHeight: "1.5",
};

const tipText = {
  color: t.muted,
  fontSize: "13px",
  margin: "8px 0 24px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const signoff = {
  color: t.inkSoft,
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "16px 0 0",
};

const signoffName = { color: t.ink };
