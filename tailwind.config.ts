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
        primary: "#1C3557",
        secondary: "#1A56A0",
        success: "#1A6B3A",
        background: "#F5F4EE",
        surface: "#FAFAF5",
        "text-primary": "#1C3557",
        "text-secondary": "#4A5568",
        border: "#D4CFBF",
        ink: "#1C3557",
        stamp: {
          red: "#CC2222",
          blue: "#1A56A0",
          green: "#1A6B3A",
          purple: "#6B2F8A",
          orange: "#C25B00",
        },
        paper: "#FAFAF5",
        "paper-line": "#E8E4D4",
        "paper-ruled": "#D6E4F0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        pulse: "pulse 0.5s ease-in-out",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      boxShadow: {
        postcard: "2px 3px 8px rgba(28,53,87,0.12), 4px 6px 20px rgba(28,53,87,0.08)",
        "postcard-hover": "4px 8px 24px rgba(28,53,87,0.18), 8px 12px 40px rgba(28,53,87,0.1)",
        "postcard-ghost": "inset 0 0 0 2px rgba(28,53,87,0.15)",
      },
      aspectRatio: {
        postcard: "5 / 3",
      },
    },
  },
  plugins: [],
};

export default config;
