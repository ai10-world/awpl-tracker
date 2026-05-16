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
        brand: {
          50:  "#fff8ed",
          100: "#ffefd4",
          200: "#ffd9a8",
          300: "#ffbc70",
          400: "#ff9332",
          500: "#ff730a",
          600: "#f05700",
          700: "#c74004",
          800: "#9e330b",
          900: "#7f2c0c",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease forwards",
        "fade-up":    "fadeUp 0.4s ease forwards",
        "fade-down":  "fadeDown 0.3s ease forwards",
        "slide-left": "slideInLeft 0.3s ease forwards",
        "scale-in":   "scaleIn 0.2s ease forwards",
        "float":      "float 6s ease-in-out infinite",
        "shimmer":    "shimmer 1.5s infinite",
        "toast-in":   "toastIn 0.3s ease forwards",
        "toast-out":  "toastOut 0.25s ease forwards",
        "pulse-brand":"pulse-brand 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:      { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp:      { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeDown:    { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInLeft: { from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:     { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        float:       { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:     { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        toastIn:     { from: { opacity: "0", transform: "translateX(100%)" }, to: { opacity: "1", transform: "translateX(0)" } },
        toastOut:    { from: { opacity: "1", transform: "translateX(0)" }, to: { opacity: "0", transform: "translateX(100%)" } },
        "pulse-brand": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
      boxShadow: {
        "brand":  "0 0 20px rgba(255,115,10,0.3), 0 0 60px rgba(255,115,10,0.08)",
        "brand-sm": "0 0 12px rgba(255,115,10,0.2)",
        "card":   "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
