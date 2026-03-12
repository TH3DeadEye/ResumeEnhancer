import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* New design-system tokens */
        "bg-base":    "var(--bg-base)",
        "bg-subtle":  "var(--bg-subtle)",
        "bg-surface": "var(--bg-surface)",
        "bg-sunken":  "var(--bg-sunken)",
        "accent":         "var(--accent)",
        "accent-hover":   "var(--accent-hover)",
        "accent-subtle":  "var(--accent-subtle)",
        /* shadcn/ui tokens (via CSS-variable aliases) */
        border:            "var(--border)",
        input:             "var(--border)",
        "input-background": "var(--bg-surface)",
        ring:        "var(--accent)",
        background:  "var(--bg-base)",
        foreground:  "var(--text-primary)",
        primary: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--bg-surface)",
        },
        secondary: {
          DEFAULT:    "var(--bg-subtle)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT:    "var(--danger)",
          foreground: "var(--bg-surface)",
        },
        muted: {
          DEFAULT:    "var(--bg-subtle)",
          foreground: "var(--text-muted)",
        },
        card: {
          DEFAULT:    "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT:    "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm:  "var(--radius-sm)",
        md:  "var(--radius-md)",
        lg:  "var(--radius-lg)",
        xl:  "var(--radius-xl)",
      },
      boxShadow: {
        sm:  "var(--shadow-sm)",
        md:  "var(--shadow-md)",
        lg:  "var(--shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
