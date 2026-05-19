// ============================================================================
// ResetPasswordForm.tsx — Set new password using token from email URL
// ============================================================================
// URL: /auth/reset-password?token=XXX
// Handles 3 states: invalid token, form, success
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../validators/reset-password";
import {
  passwordRules,
  resetPasswordDefaultValues,
} from "../constants/constants";
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

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
  });

  const passwordValue = useWatch({ control: form.control, name: "password" });
  const passwordStrength = passwordRules.filter((r) =>
    r.test(passwordValue ?? ""),
  ).length;

  const pending = form.formState.isSubmitting;

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    try {
      await authClient.resetPassword(
        { newPassword: values.password, token },
        {
          onError: (ctx) => {
            toast.error(
              ctx.error.message ?? "Please request a new reset link.",
            );
          },
          onSuccess: async () => {
            // Invalidate any existing session — user must re-authenticate
            try {
              await authClient.signOut();
            } catch {
              /* no-op */
            }
            setSuccess(true);
          },
        },
      );
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  // ── Invalid / expired token ───────────────────────
  if (!token || errorParam) {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <div className={cardCx}>
          <motion.div variants={item} className="space-y-2">
            <h1
              className="auth-display text-3xl font-bold leading-tight"
              style={gradientHeading}
            >
              Invalid link
            </h1>
            <p className="text-sm text-white/60">
              This reset link is no longer valid
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-6 space-y-5">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 shadow-[0_0_24px_rgba(244,63,94,0.3)]">
                <XCircle className="size-7 text-rose-400" />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-white/80">
                Link expired or already used
              </p>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-white/50">
                Password reset links expire after 1 hour and can be used only
                once.
              </p>
            </div>
            <Button className={primaryBtnCx} style={primaryBtnStyle} asChild>
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
            <Button variant="outline" className={ghostBtnCx} asChild>
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Success state ───────────────────────────────
  if (success) {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <div className={cardCx}>
          <motion.div variants={item} className="space-y-2">
            <h1
              className="auth-display text-3xl font-bold leading-tight"
              style={gradientHeading}
            >
              Password updated
            </h1>
            <p className="text-sm text-white/60">
              Your password has been reset successfully
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-6 space-y-5">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.15)] shadow-[0_0_24px_rgba(224,74,18,0.4)]">
                <CheckCircle2 className="size-7 text-[#FFB07A]" />
              </div>
            </div>
            <p className="text-center text-sm text-white/60">
              You can now sign in with your new password.
            </p>
            <Button className={primaryBtnCx} style={primaryBtnStyle} asChild>
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Default form ────────────────────────────────
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className={cardCx}>
        <motion.div variants={item} className="space-y-2">
          <h1
            className="auth-display text-3xl font-bold leading-tight"
            style={gradientHeading}
          >
            Reset password
          </h1>
          <p className="text-sm text-white/60">
            Create a new secure password for your account
          </p>
        </motion.div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white/70"
                >
                  New password
                </Label>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={pending}
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      inputCx,
                      "pr-10",
                      fieldState.invalid &&
                        "border-rose-500/60 focus:border-rose-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="size-3" />
                    {fieldState.error.message}
                  </p>
                )}

                {/* Strength meter */}
                {(passwordValue?.length ?? 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < passwordStrength
                              ? passwordStrength === 1
                                ? "bg-rose-500"
                                : passwordStrength === 2
                                  ? "bg-amber-400"
                                  : "bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F]"
                              : "bg-white/10",
                          )}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(passwordValue ?? "");
                        return (
                          <div
                            key={rule.label}
                            className="flex items-center gap-1.5"
                          >
                            {passed ? (
                              <Check className="size-3 text-[#FF5A1F]" />
                            ) : (
                              <X className="size-3 text-white/25" />
                            )}
                            <span
                              className={cn(
                                "text-xs transition-colors",
                                passed ? "text-[#FFB07A]" : "text-white/35",
                              )}
                            >
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-white/70"
                >
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    {...field}
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={pending}
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      inputCx,
                      "pr-10",
                      fieldState.invalid &&
                        "border-rose-500/60 focus:border-rose-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
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
              disabled={pending || passwordStrength < 3}
              className={primaryBtnCx}
              style={primaryBtnStyle}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Updating password…
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
