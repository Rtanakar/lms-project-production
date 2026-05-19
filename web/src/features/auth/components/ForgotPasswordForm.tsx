// ============================================================================
// ForgotPasswordForm.tsx — Email input → backend sends reset link
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../validators/forgot-password";
import { forgotPasswordDefaultValues } from "../constants/constants";
import {
  cardCx,
  container,
  ghostBtnCx,
  gradientHeading,
  inputCx,
  item,
  primaryBtnCx,
  primaryBtnStyle,
} from "./auth-shared";

export default function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefaultValues,
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    const email = values.email.trim().toLowerCase();
    try {
      await authClient.requestPasswordReset(
        {
          email,
          redirectTo: "/reset-password",
        },
        {
          onSuccess: () => {
            setSentTo(email);
            setEmailSent(true);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Please try again.");
          },
        },
      );
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const pending = form.formState.isSubmitting;

  // ── Success state ───────────────────────────────────
  if (emailSent) {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <div className={cardCx}>
          <motion.div variants={item} className="space-y-2">
            <h1
              className="auth-display text-3xl font-bold leading-tight"
              style={gradientHeading}
            >
              Check your email
            </h1>
            <p className="text-sm text-white/60">
              Password reset instructions sent
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-6 space-y-5">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.15)] shadow-[0_0_24px_rgba(224,74,18,0.4)]">
                <Mail className="size-7 text-[#FFB07A]" />
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <p className="text-sm font-medium text-white/80">Email sent to</p>
              <p className="inline-block rounded-lg border border-[rgba(255,90,31,0.25)] bg-[rgba(15,10,7,0.7)] px-3 py-1.5 font-mono text-sm text-[#FFB07A]">
                {sentTo}
              </p>
            </div>

            <div className="space-y-2.5 rounded-lg border border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.4)] p-4">
              {[
                "Check your inbox (and spam folder)",
                "The link expires in 1 hour",
                "Use it only once to reset your password",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#FF5A1F]" />
                  <p className="text-xs leading-relaxed text-white/60">{tip}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className={ghostBtnCx}
              onClick={() => setEmailSent(false)}
            >
              Send to a different email
            </Button>
          </motion.div>

          <motion.div variants={item} className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-[#FFB07A]"
            >
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Default form ────────────────────────────────────
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className={cardCx}>
        <motion.div variants={item} className="space-y-2">
          <h1
            className="auth-display text-3xl font-bold leading-tight"
            style={gradientHeading}
          >
            Forgot password?
          </h1>
          <p className="text-sm text-white/60">
            Enter your email and we&apos;ll send a reset link
          </p>
        </motion.div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-white/70"
                >
                  Email
                </Label>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={pending}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    inputCx,
                    fieldState.invalid &&
                      "border-rose-500/60 focus:border-rose-500",
                  )}
                />
                {fieldState.error && (
                  <p className="flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="size-3" />
                    {fieldState.error.message}
                  </p>
                )}
              </motion.div>
            )}
          />

          <motion.div variants={item}>
            <Button
              type="submit"
              disabled={pending}
              className={primaryBtnCx}
              style={primaryBtnStyle}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Sending reset link…
                </span>
              ) : (
                "Send reset link"
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={item} className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-[#FFB07A]"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
