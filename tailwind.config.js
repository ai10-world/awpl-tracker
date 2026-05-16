/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: { 300: "#ffbc70", 400: "#ff9332", 500: "#ff730a", 600: "#f05700" },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "fade-up": "fadeUp 0.4s ease forwards",
        "scale-in": "scaleIn 0.2s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
        "toast-in": "toastIn 0.3s ease forwards",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "pulse-brand": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
        toastIn: { from: { opacity: 0, transform: "translateX(100%)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
