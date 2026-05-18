import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "../lib/auth.js";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), magicLinkClient()],
});
