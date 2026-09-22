/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#070510", 900: "#0c0918", 800: "#151128", 700: "#1f1936" },
        accent: {
          DEFAULT: "#d4a437",
          soft: "#e9c979",
          blue: "#b77d18",
        },
      },
      fontFamily: {
        display: ['"Sora"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(212, 164, 55, 0.45)",
        "glow-sm": "0 0 18px -4px rgba(212, 164, 55, 0.5)",
        card: "0 10px 40px -12px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "spin-slower": "spin 16s linear infinite",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 7s ease-in-out infinite",
        "eq-bar": "eq 1s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        eq: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};
