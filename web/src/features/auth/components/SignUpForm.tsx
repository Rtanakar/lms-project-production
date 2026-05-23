// ============================================================================
// SignUpForm.tsx — Name + email + password + confirm + strength meter
// ============================================================================
// Backend: autoSignIn=true (modern SaaS soft-verify). User gets session
// immediately + verification email in background. Redirect → /dashboard.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { signUpFormSchema, type SignUpFormValues } from "../validators/signup";
import { signUpDefaultValues, passwordRules } from "../constants/constants";
import {
  cardCx,
  container,
  gradientHeading,
  inputCx,
  item,
  primaryBtnCx,
  primaryBtnStyle,
  socialBtnCx,
} from "./auth-shared";
import Github from "../../../../public/github.svg";
import Image from "next/image";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "github" | "google" | null
  >(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: signUpDefaultValues,
  });

  const passwordValue = useWatch({ control: form.control, name: "password" });
  const passwordStrength = passwordRules.filter((r) =>
    r.test(passwordValue ?? ""),
  ).length;

  const pending = form.formState.isSubmitting;
  const isLoading = pending || socialLoading !== null;

  const signUpWithGithub = async () => {
    setSocialLoading("github");
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/my-courses",
    });
  };

  const signUpWithGoogle = async () => {
    setSocialLoading("google");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/my-courses",
    });
  };

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await authClient.signUp.email(
        {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          callbackURL: "/my-courses",
        },
        {
          onSuccess: () => {
            toast.success("Account created! Welcome to LMS 🎉");
            // autoSignIn: true on backend → session cookie set
            // verification email sent in background
            router.push("/my-courses?welcome=true");
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Sign-up failed");
          },
        },
      );
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className={cardCx}>
        {/* ── Header ── */}
        <motion.div variants={item} className="space-y-2">
          <h1
            className="auth-display text-3xl font-bold leading-tight"
            style={gradientHeading}
          >
            Create account
          </h1>
          <p className="text-sm text-white/60">
            Already a member?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-[#FF5A1F] underline-offset-2 transition-colors hover:text-[#FFB07A] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* ── Social OAuth ── */}
        <motion.div variants={item} className="mt-7 grid gap-3">
          <Button
            type="button"
            variant="outline"
            className={socialBtnCx}
            onClick={signUpWithGoogle}
            disabled={isLoading}
          >
            {socialLoading === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2 text-sm font-medium">
              Sign up with Google
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={socialBtnCx}
            onClick={signUpWithGithub}
            disabled={isLoading}
          >
            {socialLoading === "github" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Image src={Github} alt="Github Logo" className="size-5" />
            )}
            <span className="ml-2 text-sm font-medium">
              Sign up with GitHub
            </span>
          </Button>
        </motion.div>

        <motion.div variants={item} className="relative my-6">
          <div className="h-px bg-[rgba(255,90,31,0.15)]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(20,12,8,0.95)] px-3 text-[11px] font-medium uppercase tracking-wider text-white/40">
            Or with email
          </span>
        </motion.div>

        {/* ── Form ── */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-white/70"
                >
                  Full name
                </Label>
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Ratnakar Mishra"
                  autoComplete="name"
                  disabled={isLoading}
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

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-white/70"
                >
                  Email address
                </Label>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
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

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <motion.div variants={item} className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white/70"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
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
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
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
              disabled={isLoading || passwordStrength < 3}
              className={primaryBtnCx}
              style={primaryBtnStyle}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </motion.div>
        </form>

        <motion.p
          variants={item}
          className="mt-6 text-center text-xs leading-relaxed text-white/40"
        >
          By signing up you agree to our{" "}
          <Link
            href="/terms"
            className="text-[#FFB07A] hover:text-[#FF5A1F] hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-[#FFB07A] hover:text-[#FF5A1F] hover:underline"
          >
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── Google brand SVG (inline — no separate file needed) ───
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.7 6.2 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.7 6.2 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5 0-9.4-3.3-11.1-8H6.3C9.5 39.7 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.6 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
