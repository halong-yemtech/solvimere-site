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
        "main-dark": "#111928",
        // Accent colour from Portfolio settings, set on .pf-root by PortfolioPage.
        "main-orange": "rgb(var(--accent) / <alpha-value>)",
      },
      transitionProperty: { width: "width" },
      typography: {
        DEFAULT: {
          css: {
            color: "#9ca3af",
            "h1, h2, h3, h4, h5, h6": { margin: 0, color: "inherit" },
            p: { fontSize: "1.5rem", lineHeight: 1.5 },
            strong: { color: "inherit" },
            blockquote: {
              color: "inherit",
              lineHeight: 1.4,
              borderLeft: "0.5rem solid #b6bac2",
              background: "rgba(98, 98, 98, .2)",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            "blockquote > p": { fontSize: "1.4rem", padding: "1.2rem 1.6rem 1.2rem 0" },
            "ul li": { fontSize: "1.3rem", color: "#d1d5db", marginBottom: "0.2rem" },
          },
        },
      },
    },
  },
  plugins: [typography],
};
