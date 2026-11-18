import typography from "@tailwindcss/typography";

/**
 * Tailwind is used only by the portfolio pages (src/portfolio). Every utility is scoped
 * under .pf-root and the global reset is off (a scoped copy is in portfolio.css), so the
 * rest of the site keeps its own CSS untouched.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./src/portfolio/**/*.{ts,tsx}"],
  important: ".pf-root",
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Neutral greys matching the main site (#08080a page, #121216 cards) instead of Tailwind's blue-greys.
        gray: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#7c7c86",
          600: "#55555e",
          700: "#2c2c33",
          800: "#1c1c22",
          900: "#121216",
          950: "#08080a",
        },
        "main-dark": "#111928",
        // Accent colour from Portfolio settings, set on .pf-root by PortfolioPage.
        "main-orange": "rgb(var(--accent) / <alpha-value>)",
      },
      transitionProperty: { width: "width" },
      typography: {
        DEFAULT: {
          css: {
            color: "#a1a1aa",
            "h1, h2, h3, h4, h5, h6": { margin: 0, color: "inherit" },
            p: { fontSize: "1.5rem", lineHeight: 1.5 },
            strong: { color: "inherit" },
            blockquote: {
              color: "inherit",
              lineHeight: 1.4,
              borderLeft: "0.3rem solid rgb(var(--accent))",
              background: "rgba(255, 255, 255, .04)",
              borderRadius: "0 1rem 1rem 0",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            "blockquote > p": { fontSize: "1.4rem", padding: "1.2rem 1.6rem 1.2rem 0" },
            "ul li": { fontSize: "1.5rem", color: "#d4d4d8", marginBottom: "0.4rem" },
            a: { color: "rgb(var(--accent))", textDecoration: "none" },
          },
        },
      },
    },
  },
  plugins: [typography],
};
