import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFCFA",
          100: "#FAF9F7",
          200: "#F5F2EE",
          300: "#EDE8E2",
          400: "#DDD6CC",
        },
        teal: {
          50: "#E8F5F4",
          100: "#C8E6E3",
          200: "#A0D4CF",
          300: "#7AC2BC",
          400: "#6BBFB5",
          500: "#5AB0A6",
          600: "#4A9A90",
          700: "#3A7A72",
          800: "#2D5E58",
          900: "#1E3D3A",
        },
        blush: {
          50: "#FEF8F7",
          100: "#FDF0EE",
          200: "#F8E4E0",
          300: "#F0C8C0",
          400: "#E4A89C",
        },
        sand: {
          100: "#F5EEE6",
          200: "#EAD9C8",
          300: "#D4B896",
          400: "#B89A78",
          500: "#9A7C5A",
        },
      },
      fontFamily: {
        script: ["var(--font-dancing)", "cursive"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        ticker: "ticker 30s linear infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
