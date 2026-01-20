import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        roseQuartz: "#F7CAC9",
        serenity: "#92A8D1",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(244, 114, 182, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
