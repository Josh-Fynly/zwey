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
          bg: "rgb(var(--zwey-bg) / <alpha-value>)",
          surface: "rgb(var(--zwey-surface) / <alpha-value>)",
          elevated: "rgb(var(--zwey-elevated) / <alpha-value>)",
          border: "rgb(var(--zwey-border) / <alpha-value>)",
          text: "rgb(var(--zwey-text) / <alpha-value>)",
          muted: "rgb(var(--zwey-muted) / <alpha-value>)",
          violet: "rgb(var(--zwey-violet) / <alpha-value>)",
          violetBright:
            "rgb(var(--zwey-violet-bright) / <alpha-value>)",
          violetDeep:
            "rgb(var(--zwey-violet-deep) / <alpha-value>)",
          success:
            "rgb(var(--zwey-success) / <alpha-value>)",
          error:
            "rgb(var(--zwey-error) / <alpha-value>)",
          warning:
            "rgb(var(--zwey-warning) / <alpha-value>)",
        },
      },
      boxShadow: {
        "zwey-card": "0 18px 50px rgba(0, 0, 0, 0.24)",
        "zwey-focus":
          "0 0 0 4px rgba(124, 58, 237, 0.14)",
        "zwey-accent":
          "0 8px 30px rgba(124, 58, 237, 0.16)",
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
