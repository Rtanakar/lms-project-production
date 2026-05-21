import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns up to 2 uppercase initials from a person's name.
 *
 * Multi-word: first letter of first two words. "Ratnakar Mishra" → "RM".
 * Single-word camelCase / PascalCase: first letter + first inner capital.
 *   "RatnakarMishra" → "RM".
 * Single-word lowercase: first 2 letters. "ratnakarmishra" → "RA".
 *
 * Falls back to "?" when name is missing — Avatar never renders empty.
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";

  const trimmed = name.trim();
  if (!trimmed) return "?";

  // Multi-word path
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
  }

  // Single-word — try inner capital (PascalCase / camelCase)
  const word = words[0] ?? "";
  const innerCap = word.slice(1).match(/[A-Z]/);
  if (innerCap) {
    return (word[0]! + innerCap[0]!).toUpperCase();
  }

  // Pure lowercase / single string — take first 2 chars
  return word.slice(0, 2).toUpperCase();
}

/**
 * Derives a friendly display name from an email when no real name is
 * available. Used as the User.name fallback for fresh magic-link signups
 * (Better Auth requires `name` to be non-null but magic link doesn't ask).
 *
 * Heuristics applied in order:
 *   1. Strip digits at the END only (so "ratnakar123" → "ratnakar",
 *      but "ratnakar2k" stays "ratnakar2k").
 *   2. Split on `.`, `_`, `-` separators → "john.doe" → "John Doe".
 *   3. Split camelCase / PascalCase → "ratnakarMishra" → "Ratnakar Mishra".
 *   4. Single bare word stays bare → "ratnakarmishra" → "Ratnakarmishra".
 *      For these cases configure ADMIN_NAMES (see auth.ts) for a proper
 *      multi-word name, otherwise the user can rename in /profile.
 */
export function nameFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? "user").replace(/\d+$/g, "");

  const parts = local
    // Step 2 — separator split
    .split(/[._-]+/)
    .flatMap((p) =>
      // Step 3 — camelCase split (insert a space before each capital)
      p.replace(/([a-z])([A-Z])/g, "$1 $2").split(/\s+/),
    )
    .filter(Boolean);

  if (parts.length === 0) return "User";

  return parts
    .map((p) => p[0]!.toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}
