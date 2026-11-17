import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The portfolio lives inside the Solvimere site: a member's portfolio is
 * /team/<slug>. The site's dev server (vite.config.js) and Vercel
 * (vercel.json) forward /team/* here; /team itself stays the site's team page.
 */
export const BASE_PATH = "/team";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: BASE_PATH,
  // Lets client code build URLs for plain <a href>, fetch() and window.location.
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  // The Payload admin UI was replaced by /dashboard and /login.
  async redirects() {
    return [
      { source: "/admin/login", destination: "/login", permanent: false },
      { source: "/admin/forgot", destination: "/forgot-password", permanent: false },
      { source: "/admin/reset/:token", destination: "/reset-password?token=:token", permanent: false },
      { source: "/admin/create-first-user", destination: "/setup", permanent: false },
      { source: "/admin/:path*", destination: "/dashboard", permanent: false },
      { source: "/admin", destination: "/dashboard", permanent: false },
    ];
  },
  // PDF résumés (/cv) are rendered on the server with react-pdf and bundled fonts.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/cv": ["./lib/cv/fonts/**"],
    "/cv/[slug]": ["./lib/cv/fonts/**"],
  },
  experimental: {
    // On-site media uploads go through a server action. Images are downscaled in
    // the browser first; Vercel caps request bodies at 4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    remotePatterns: [
      // Media stored in Vercel Blob (when BLOB_READ_WRITE_TOKEN is set)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },
  turbopack: { root: path.resolve(dirname) },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
