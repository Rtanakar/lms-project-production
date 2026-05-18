// ============================================================================
// eslint.config.mjs — Flat config (ESLint 9+) for TypeScript + Node
// ============================================================================
// Flat config = naya standard (legacy .eslintrc deprecated). Industry me ab
// sab projects flat config pe migrate ho rahe hain.
//
// Stack:
//   - @eslint/js          → core JS rules
//   - typescript-eslint   → TS-aware rules (no unused vars, etc.)
//   - eslint-config-prettier → prettier ke saath conflicting rules turn off
// ============================================================================

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Ignored paths — generated/build files lint nahi karne
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "coverage/**",
      "logs/**",
      "*.config.mjs",
      "*.config.js",
    ],
  },

  // Base recommended
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Prettier — last me rakho taaki formatting conflicts disable ho
  prettier,

  // Custom rules
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Console — production me log libraries (Pino) use karna chahiye
      // warn/error allowed (legacy code paths ke liye)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Unused vars — _prefix se ignore karwa sakte ho (jaise _next in error handler)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Type imports explicit — bundle size + clarity
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // any ko warn — kabhi kabhi zaruri hota hai but discourage karo
      "@typescript-eslint/no-explicit-any": "warn",

      // Equality strict
      eqeqeq: ["error", "always"],

      // Code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-duplicate-imports": "error",
    },
  },
);
