import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Tattle-inspired brand colors
        brand: {
          DEFAULT: "#E76D67", // Coral/salmon primary
          50: "#FDF3F2",
          100: "#FCE7E5",
          200: "#F9CCC9",
          300: "#F5ADA9",
          400: "#F08D87",
          500: "#E76D67", // Main brand
          600: "#E04E47",
          700: "#C63630",
          800: "#A42F28",
          900: "#872A24",
        },
        "accent-purple": {
          DEFAULT: "#514E80", // Deep purple
          50: "#F5F5F9",
          100: "#EBEBF3",
          200: "#D2D0E3",
          300: "#B5B1CF",
          400: "#9590B8",
          500: "#7F7AB0",
          600: "#514E80", // Main accent
          700: "#3F3D62",
          800: "#2F2D48",
          900: "#252653",
        },
        "accent-light": {
          DEFAULT: "#7F7AB0",
          50: "#F7F6FC",
          100: "#EFEEF9",
          200: "#DDD9F0",
          300: "#C5BFE4",
          400: "#A9A1D5",
          500: "#7F7AB0",
          600: "#6A6599",
          700: "#565280",
          800: "#454167",
          900: "#393654",
        },
        neutral: {
          pink: "#E68BBA",
          purple: "#856993",
          cream: "#EDC9C4",
          maroon: "#70234B",
        },
        visuals: {
          1: "#ffebcb",
          2: "#fcbfa4",
          3: "#f4c6d7",
          4: "#f39695",
          5: "#e99469",
          6: "#f3a444",
          7: "#e56d67",
          8: "#815089",
          9: "#4d5182",
          10: "#020637",
        },
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
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
