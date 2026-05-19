// ============================================================================
// VerifyEmailClient.tsx — Resend verification email
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  cardCx,
  container,
  ghostBtnCx,
  gradientHeading,
  item,
  primaryBtnCx,
  primaryBtnStyle,
} from "./auth-shared";

interface VerifyEmailClientProps {
  email?: string;
}

export default function VerifyEmailClient({ email }: VerifyEmailClientProps) {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not provided");
      return;
    }
    setSending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?verified=true`,
      });
      toast.success("Verification email sent 📧");
      setCooldown(60);
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className={cardCx}>
        <motion.div variants={item} className="space-y-1.5">
          <h1
            className="text-[28px] font-bold leading-tight tracking-tight"
            style={gradientHeading}
          >
            Verify your email
          </h1>
          <p className="text-sm text-white/55">Link sent to your inbox</p>
        </motion.div>

        <motion.div variants={item} className="mt-5 space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.12)] shadow-[0_0_20px_rgba(224,74,18,0.3)]">
              <Mail className="size-6 text-[#FFB07A]" />
            </div>
          </div>

          {email && (
            <div className="space-y-1 text-center">
              <p className="text-xs font-medium text-white/70">Sent to</p>
              <p className="inline-block rounded-lg border border-[rgba(255,90,31,0.2)] bg-[rgba(15,10,7,0.7)] px-2.5 py-1 font-mono text-xs text-[#FFB07A]">
                {email}
              </p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldown > 0 || !email}
            className={primaryBtnCx}
            style={primaryBtnStyle}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </span>
            ) : cooldown > 0 ? (
              <span className="flex items-center gap-2">
                <RefreshCcw className="size-4" />
                Resend in {cooldown}s
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCcw className="size-4" />
                Resend email
              </span>
            )}
          </Button>

          <Button variant="outline" className={ghostBtnCx} asChild>
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        </motion.div>

        <motion.div variants={item} className="mt-5 text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-[#FFB07A]"
          >
            <ArrowLeft className="size-3" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
