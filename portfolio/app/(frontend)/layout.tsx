import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getSiteData } from "@/lib/site";
import { getPageData } from "@/lib/auth";
import { DEFAULT_ACCENT, FONT_OPTIONS, hexToRgbChannels } from "@/lib/settingsDefaults";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only downloaded when chosen in Site settings → Appearance.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });

// Portfolios are part of the Solvimere site: use its icon (served by the site at /favicon.png).
const icons: Metadata["icons"] = { icon: [{ url: "/favicon.png", type: "image/png" }] };

export async function generateMetadata(): Promise<Metadata> {
  const profile = (await getSiteData())?.profile;
  if (!profile) return { title: "Portfolio", icons };
  return {
    title: `${profile.name} | ${profile.jobTitle}`,
    description: profile.metaDescription || undefined,
    icons,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { site } = await getPageData();
  const theme = site?.settings.theme;
  const font = FONT_OPTIONS.find((f) => f.value === theme?.font) ?? FONT_OPTIONS[0];
  const cssVars = `:root{--accent:${hexToRgbChannels(theme?.accent || DEFAULT_ACCENT)};--site-font:${font.css};}`;

  return (
    <html lang="en">
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
