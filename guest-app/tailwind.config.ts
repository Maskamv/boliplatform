import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        accent: "#0F766E",
        accentDark: "#0D6259",
        background: "#F8FAFC",
        muted: "#E8ECF1",
        mutedForeground: "#64748B",
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
