import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./app/privacy-policy/**/*.{js,ts,jsx,tsx,mdx}",
    "./presentation-templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        sans:    ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        syne:    ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        inter:   ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        unbounded: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        /* Orately semantic color helpers */
        mint: {
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          pale: "#CCFBF1",
          deep: "#134E4A",
        },
        sand: {
          base:    "#EAE7DF",
          surface: "#F5F2EA",
          muted:   "#DEDAD0",
        },
        coal: {
          ink:  "#1A1713",
          soft: "#78726C",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        sm:   "8px",
        md:   "12px",
        lg:   "16px",
        xl:   "24px",
        "2xl": "32px",
        pill: "999px",
      },
      boxShadow: {
        sm:      "0 4px 12px -6px rgba(100,95,85,0.10)",
        premium: "0 12px 28px -10px rgba(100,95,85,0.10)",
        lg:      "0 24px 48px -16px rgba(100,95,85,0.14)",
        focus:   "0 0 0 3px rgba(20,184,166,0.30)",
        mint:    "0 8px 18px -10px rgba(20,184,166,0.65)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
