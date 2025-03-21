import baseConfig from "@acme/eslint-config/base";
import nextjsConfig from "@acme/eslint-config/nextjs";
import reactConfig from "@acme/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**", ".contentlayer/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
