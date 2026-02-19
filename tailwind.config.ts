import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fffef8",
        foreground: "#1f2937",
        accent: "#0f766e",
        "accent-foreground": "#ffffff"
      }
    }
  },
  plugins: []
};

export default config;
