import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // The portfolio app (../portfolio, Next.js under /team) answers the admin's
  // portfolio requests (/team/api/admin) and serves its media and previews.
  const portfolio = env.PORTFOLIO_DEV_URL || "http://localhost:3000";
  return {
    plugins: [react()],
    publicDir,
    server: {
      host: "127.0.0.1",
      port: 5174,
      strictPort: true,
      proxy: { "^/team/.+": { target: portfolio, ws: true } },
    },
  };
});
