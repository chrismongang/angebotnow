import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#EAEAEA",
        input: "#EAEAEA",
        ring: "#F89813",
        background: "#FFFFFF",
        foreground: "#171717",
        primary: {
          DEFAULT: "#F89813",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4F4F4",
          foreground: "#171717",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F4F4F4",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F4F4F4",
          foreground: "#171717",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        "soft": "0 8px 24px rgba(0,0,0,0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
