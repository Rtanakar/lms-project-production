// ============================================================================
// auth-client.ts — Better Auth React client (frontend)
// ============================================================================
// Backend (Express at localhost:8080) ke /api/auth/* routes ko call karta hai.
// Cookies cross-origin automatically chalti hain kyunki:
//   - backend cookie domain = localhost (host only, port-agnostic)
//   - fetchOptions.credentials = "include"
//
// Simple keeping it — admin plugin abhi nahi (backend me bhi nahi).
// Role-based UI ke liye `useSession().data.user.role` se branch karenge.
// ============================================================================

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "./env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,

  fetchOptions: {
    // Cross-origin cookies — without this, sessions don't work
    credentials: "include",
  },

  plugins: [
    // Backend ke User model me `role` custom field hai — yaha mirror karte hain
    // taki TS me typed access mile: session.user.role
    inferAdditionalFields<{
      user: {
        role: { type: "string" };
      };
    }>(),
  ],
});

// Convenient typed re-exports — components me clean import
export const {
  signUp,
  signIn,
  signOut,
  useSession,
  resetPassword,
  requestPasswordReset,
  sendVerificationEmail,
  deleteUser,
  getSession,
  changePassword,
  changeEmail,
} = authClient;
