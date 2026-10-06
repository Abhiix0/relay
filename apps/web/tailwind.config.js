/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Semantic surface tokens ──────────────────────────
        surface: {
          DEFAULT: "var(--surface)",
          accent:   "var(--surface-accent)",
          product:  "var(--surface-product)",
          raised:   "var(--surface-raised)",
          code:     "var(--surface-code)",
        },
        // ── Semantic border tokens ───────────────────────────
        border: {
          DEFAULT: "var(--border)",
          light:   "var(--border-light)",
          accent:  "var(--border-accent)",
        },
        // ── Semantic text tokens ─────────────────────────────
        text: {
          DEFAULT: "var(--text)",
          muted:   "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        // ── Brand palette ────────────────────────────────────
        linen: {
          DEFAULT: "var(--linen)",
          deep:    "var(--linen-deep)",
        },
        paper:   "var(--paper)",
        charcoal: {
          DEFAULT: "var(--charcoal)",
          soft:    "var(--charcoal-soft)",
          muted:   "var(--charcoal-muted)",
        },
        carbon: "var(--carbon)",
        copper: {
          DEFAULT: "var(--copper)",
          dark:    "var(--copper-dark)",
        },
        moss: "var(--moss)",
        sun:  "var(--sun)",
        blue: "var(--blue)",
        // ── Status ───────────────────────────────────────────
        success: "var(--success)",
        warning: "var(--warning)",
        error:   "var(--error)",
        // ── Sidebar ──────────────────────────────────────────
        sidebar: {
          DEFAULT:     "var(--sidebar-bg)",
          hover:       "var(--sidebar-item-hover)",
          active:      "var(--sidebar-item-active)",
          divider:     "var(--sidebar-divider)",
        },
        // ── Overlay ──────────────────────────────────────────
        overlay: "var(--overlay)",
        // ── Chart / health ────────────────────────────────────
        chart: {
          healthy:  "var(--chart-healthy)",
          warning:  "var(--chart-warning)",
          critical: "var(--chart-critical)",
          idle:     "var(--chart-idle)",
          accent:   "var(--chart-accent)",
        },
      },
      fontFamily: {
        sans:  ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono:  ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
