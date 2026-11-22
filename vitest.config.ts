import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/unit/setup.ts"],
    clearMocks: true,
    env: { VITE_API_URL: "", VITE_API_PREFIX: "/api/v1", VITE_GOOGLE_CLIENT_ID: "" },
    coverage: {
      provider: "v8",
      include: [
        "src/features/cart/context/cart-context.tsx",
        "src/features/cart/api/*.ts",
        "src/features/cart/lib/*.ts",
        "src/shared/api/api-client.ts",
        "src/shared/ui/button.tsx",
        "src/app/components/Require*.tsx",
        "src/features/auth/api/auth-service.ts",
        "src/features/catalog/components/CatalogFeedback.tsx",
      ],
      reporter: ["text", "json-summary"],
      reportsDirectory: "artifacts/unit-coverage",
    },
  },
});
