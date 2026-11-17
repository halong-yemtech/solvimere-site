import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Team portfolios (portfolio/, a Next.js app served under /team) run on their own dev server.
  const portfolio = env.PORTFOLIO_DEV_URL || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: {
        // /team/<member> (and the portfolio's assets, API and dashboard under /team/…)
        // goes to the portfolio app; /team itself stays this site's team page.
        // Production does the same with a rewrite in vercel.json.
        "^/team/.+": { target: portfolio, ws: true },
      },
    },
  };
});
