import type { Config } from "tailwindcss";
// @ts-expect-error daisyui ships no type declarations
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "main-dark": "#111928",
        // Accent color, set at runtime from Site settings (see app/(frontend)/layout.tsx).
        "main-orange": "rgb(var(--accent) / <alpha-value>)",
      },
      transitionProperty: {
        width: "width",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#9ca3af",
            "h1, h2, h3, h4, h5, h6": {
              margin: 0,
              color: "inherit",
            },
            p: {
              fontSize: "1.5rem",
              lineHeight: 1.5,
            },
            strong: {
              color: "inherit",
            },
            blockquote: {
              color: "inherit",
              lineHeight: 1.4,
              borderLeft: "0.5rem solid #b6bac2",
              background: "rgba(98, 98, 98, .2)",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            "blockquote > p": {
              fontSize: "1.4rem",
              padding: "1.2rem 1.6rem 1.2rem 0",
            },
            "ul li": {
              fontSize: "1.3rem",
              color: "#d1d5db",
              marginBottom: "0.2rem",
            },
          },
        },
      },
    },
  },
  plugins: [daisyui, typography],
};

export default config;
