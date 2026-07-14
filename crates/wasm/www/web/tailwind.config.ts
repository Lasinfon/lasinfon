import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Virgil Pana / Lasinfon Brand Colors
        brand: {
          primary: "#2459F1",
          primaryHover: "#1A46C7",
          purple: "#7C3AED",
          pink: "#DB2777",
          blue: "#3B82F6",
          green: "#16A34A",
          red: "#EF4444",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          900: "#0f172a",
        }
      },
    },
  },
  plugins: [],
};
export default config;
