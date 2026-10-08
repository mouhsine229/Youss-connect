/** YOUSS CONNECT — design tokens.
 *  Les couleurs sont des variables CSS (voir src/styles.css) pour permettre
 *  le thème sombre sans dupliquer les classes dans les écrans. */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        surface: v("--c-surface"),
        "surface-low": v("--c-surface-low"),
        card: v("--c-card"),
        "card-high": v("--c-card-high"),
        ink: v("--c-ink"),
        "ink-2": v("--c-ink-2"),
        "ink-3": v("--c-ink-3"),
        line: v("--c-line"),
        inverse: v("--c-inverse"),
        "inverse-ink": v("--c-inverse-ink"),
        gold: "#C9A227",
        "gold-soft": "#F4E4B3",
        "gold-deep": "#A07812",
        danger: "#BA1A1A",
        "danger-soft": "#FFDAD6",
        success: "#1B7F4C",
        "success-soft": "#DCF5E6",
        warn: "#B45309",
        "warn-soft": "#FEF3C7"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.125rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,.04), 0 6px 20px rgba(10,10,10,.05)",
        float: "0 12px 32px rgba(10,10,10,.16)",
        gold: "0 8px 24px rgba(201,162,39,.32)"
      },
      maxWidth: { content: "1200px", narrow: "680px" },
      keyframes: {
        "screen-in": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "none" } },
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "pop": { "0%": { transform: "scale(.6)", opacity: 0 }, "70%": { transform: "scale(1.08)", opacity: 1 }, "100%": { transform: "scale(1)" } },
        "pulse-ring": { "0%": { boxShadow: "0 0 0 0 rgba(201,162,39,.45)" }, "100%": { boxShadow: "0 0 0 18px rgba(201,162,39,0)" } },
        "scan": { "0%": { top: "8%" }, "50%": { top: "88%" }, "100%": { top: "8%" } },
        "kenburns": { from: { transform: "scale(1)" }, to: { transform: "scale(1.12)" } },
        "shimmer": { from: { backgroundPosition: "-400px 0" }, to: { backgroundPosition: "400px 0" } }
      },
      animation: {
        "screen-in": "screen-in .22s ease-out both",
        "fade-in": "fade-in .3s ease-out both",
        pop: "pop .45s cubic-bezier(.2,.8,.2,1) both",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
        scan: "scan 2.4s ease-in-out infinite",
        kenburns: "kenburns 12s ease-out both",
        shimmer: "shimmer 1.4s linear infinite"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")({ strategy: "class" })]
};
