// ============================================================================
// signup.ts — Sign-up form Zod schema (no confirm password — modern UX)
// ============================================================================
// Industry pattern: confirm password DROPPED. Why?
//   - Show-password toggle (eye icon) lets user verify what they typed
//   - Reduces form length / abandonment
//   - Vercel, Linear, GitHub, Stripe — sab is pattern pe hain
// ============================================================================

import { z } from "zod";

export const signUpFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be less than 60 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/\d/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
