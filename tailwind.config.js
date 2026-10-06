const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zwey: {
          bg: "#08080B",
          surface: "#111116",
          elevated: "#18181F",
          border: "#272731",
          text: "#F5F5F7",
          muted: "#A1A1AA",
          violet: "#8B5CF6",
          violetBright: "#A78BFA",
          violetDeep: "#7C3AED",
          success: "#22C55E",
          error: "#EF4444",
          warning: "#F59E0B",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

module.exports = config;
