import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `cloudflare:workers` is provided by the Workers runtime and therefore
      // cannot be resolved when running on Node.
      "cloudflare:workers": fileURLToPath(
        new URL("./tests/cloudflare-workers-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
