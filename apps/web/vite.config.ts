import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import wasmModule from "vite-plugin-wasm";
import solid from "vite-plugin-solid";

const apiUrl = process.env.TOOLS_API_URL ?? "http://127.0.0.1:8787";
const wasm = wasmModule as unknown as () => Plugin;

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid(), tailwindcss(), wasm()],
  optimizeDeps: {
    exclude: ["@automerge/automerge"],
  },
  server: {
    proxy: {
      "/info": apiUrl,
      "/sync": {
        target: apiUrl,
        ws: true,
      },
    },
  },
});
