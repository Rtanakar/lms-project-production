// ============================================================================
// constants.ts — Form default values + shared theme tokens
// ============================================================================

import type { SignInFormValues } from "../validators/signin";
import type { SignUpFormValues } from "../validators/signup";
import type { ForgotPasswordValues } from "../validators/forgot-password";
import type { ResetPasswordValues } from "../validators/reset-password";

export const signInDefaultValues: SignInFormValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues: SignUpFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const forgotPasswordDefaultValues: ForgotPasswordValues = {
  email: "",
};

export const resetPasswordDefaultValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

// Password strength — used in SignUp + Reset password forms
export const passwordRules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
];
