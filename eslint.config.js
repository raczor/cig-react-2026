import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Capitalized names are components used only through JSX, which core ESLint can't see.
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // Node files.
  { files: ["vite.config.js", "eslint.config.js", "api/**"], languageOptions: { globals: globals.node } },
];
