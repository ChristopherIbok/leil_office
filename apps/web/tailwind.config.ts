import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        muted: "#667085",
        line: "#D9DEE8",
        surface: "#F7F9FC",
        brand: "#0E7C66",
        accent: "#C75D2C"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
