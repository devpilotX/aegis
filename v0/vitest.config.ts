import { defineConfig } from "vitest/config";

/**
 * Coverage floors come from `.kiro/steering/testing.md`. `token` belongs to the
 * frontend group, which is 95% line and 90% branch. They are configured here
 * from the start rather than added later, because a floor introduced after the
 * code exists is a floor chosen to fit the code.
 */
export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"],
      thresholds: {
        lines: 95,
        branches: 90,
        functions: 95,
        statements: 95,
      },
    },
  },
});
