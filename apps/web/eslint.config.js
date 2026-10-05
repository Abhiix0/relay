import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Prevent console.* outside the logger module
      "no-console": "error",
    },
  },
  // The logger module is the single approved place for console calls
  {
    files: ["src/lib/log.ts"],
    rules: { "no-console": "off" },
  },
  // T-owned and ASG-owned feature folders — no-console not enforced by K
  {
    files: [
      "src/features/handoff/**",
      "src/features/onboarding/**",
      "src/features/profile/**",
      "src/features/settings/**",
      "src/features/ask/**",
      "src/features/landing/**",
    ],
    rules: { "no-console": "off" },
  }
);
