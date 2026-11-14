import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));

export default defineConfig({
  plugins: [react()],
  publicDir,
  server: { host: "127.0.0.1", port: 5174, strictPort: true },
});
