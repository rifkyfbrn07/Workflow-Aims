import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#008651", // Pertamina Green
          foreground: "#FFFFFF",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#008651",
          700: "#006837",
          800: "#065f46",
          900: "#064e3b",
        },
        secondary: {
          DEFAULT: "#0055A5", // Pertamina Blue
          foreground: "#FFFFFF",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#0055A5",
          700: "#004382",
          800: "#003261",
          900: "#002344",
        },
        pertamina: {
          green: "#008651",
          "green-hover": "#007244",
          "green-light": "#00A651",
          "green-subtle": "#F0FDF4",
          "green-border": "#BBF7D0",
          blue: "#0055A5",
          "blue-hover": "#00478B",
          "blue-light": "#0284C7",
          "blue-subtle": "#F0F7FF",
          "blue-border": "#BAE6FD",
          navy: "#0F172A",
          charcoal: "#1E293B",
          surface: "#F8FAFC",
          muted: "#64748B",
          border: "#E2E8F0",
          red: "#DC2626",
          amber: "#D97706",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#008651",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
