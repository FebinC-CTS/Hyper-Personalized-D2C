/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primo: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#b9ceff",
          300: "#8badff",
          400: "#5a85ff",
          500: "#345eff",
          600: "#1f3df0",
          700: "#1a2dcc",
          800: "#15259e",
          900: "#0B3D91",
          950: "#081b4d",
        },
        aqua: {
          400: "#3fd0d4",
          500: "#1bb8be",
          600: "#0e9499",
        },
        coral: {
          400: "#ff8a7a",
          500: "#ff6a55",
          600: "#e64a33",
        },
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        lift: "0 8px 24px -8px rgb(16 24 40 / 0.12), 0 4px 8px -4px rgb(16 24 40 / 0.06)",
      },
      backgroundImage: {
        "ai-gradient":
          "linear-gradient(120deg, #345eff 0%, #1bb8be 45%, #ff6a55 100%)",
        "ai-shimmer":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
      },
      animation: {
        "ai-pulse": "ai-pulse 4s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
      keyframes: {
        "ai-pulse": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
