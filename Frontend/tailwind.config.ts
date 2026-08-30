import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: {
          950: "#07090d",
          900: "#0b0e14",
          800: "#12161f",
          700: "#1b2130",
          600: "#262e42",
        },
        amber: {
          400: "#f5c451",
          500: "#e6ac2c",
        },
        crime: {
          500: "#c0392b",
          400: "#e05a4a",
        },
      },
      fontFamily: {
        detective: ["'Courier New'", "Courier", "monospace"],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "noir-fade": "radial-gradient(ellipse at top, #1b2130 0%, #07090d 70%)",
        spotlight: "radial-gradient(circle at 50% 0%, rgba(245,196,81,0.15), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 25px rgba(245,196,81,0.25)",
        "glow-red": "0 0 25px rgba(192,57,43,0.35)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
