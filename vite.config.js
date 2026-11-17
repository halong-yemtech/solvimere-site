import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Portfolio code (src/portfolio) imports its own modules as "@/…".
    alias: { "@": fileURLToPath(new URL("./src/portfolio", import.meta.url)) },
  },
  server: { host: "127.0.0.1", port: 5173 },
});
