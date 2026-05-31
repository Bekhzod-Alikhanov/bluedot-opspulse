import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        signal: {
          DEFAULT: "#f5a524",
          soft: "#fbbf24",
        },
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "70%": { transform: "scale(2.2)", opacity: "0" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.35s ease-out both",
        "fade-up": "fade-up 0.5s ease-out both",
        "drawer-in": "drawer-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
