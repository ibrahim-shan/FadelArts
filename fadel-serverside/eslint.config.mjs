// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * ESLint 9 flat config for TypeScript backend / Next.js projects.
 * Features:
 * - Full TypeScript + JS support
 * - Node globals
 * - Strict & performant rules
 * - Compatible with Prettier (stylistic rules disabled)
 */

export default tseslint.config(
  // 1️⃣ Ignore build artifacts and dependencies
  {
    ignores: ["dist/**", "build/**", "node_modules/**", ".next/**", "coverage/**", "*.config.*"],
  },

  // 2️⃣ Base JS rules (ES2024)
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },

  // 3️⃣ TypeScript rules
  ...tseslint.configs.recommended,
  // If you want type-aware linting (requires tsconfig.json):
  // ...tseslint.configs.recommendedTypeChecked,

  // 4️⃣ Project-specific overrides
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: false, // set to ['./tsconfig.json'] if using type-aware linting
      },
    },
    rules: {
      // --- General ---
      "no-console": "warn",
      "no-debugger": "error",

      // --- TypeScript ---
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

      // --- Best Practices ---
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // 5️⃣ Optional Prettier compatibility layer
  {
    name: "disable-stylistic-conflicts",
    rules: {
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
);
