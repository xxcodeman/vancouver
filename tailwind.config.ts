import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        rose: "#F7CAC9",
        serenity: "#92A8D1",
        ink: "#2B2B2B",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        blob: "28px",
      },
      fontFamily: {
        pretendard: ["Pretendard", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
