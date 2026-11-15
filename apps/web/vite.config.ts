import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const apiUrl = process.env.TOOLS_API_URL ?? "http://127.0.0.1:8787";

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    proxy: {
      "/info": apiUrl,
    },
  },
});
