import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#0f8a64",
          700: "#0b6f52",
          800: "#075540"
        },
        ink: "#17211f",
        paper: "#ffffff",
        line: "#dfe7e3",
        gold: "#b88214"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 33, 31, 0.06)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
