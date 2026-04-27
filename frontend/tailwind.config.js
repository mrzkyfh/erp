/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "#94A3B8",
        input: "#CBD5E1",
        ring: "#475569",
        background: "#F8FAFC",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#475569",
          foreground: "#F8FAFC",
        },
        secondary: {
          DEFAULT: "#334155",
          foreground: "#F8FAFC",
        },
        tertiary: {
          DEFAULT: "#94A3B8",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#E2E8F0",
          foreground: "#1E293B",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FEF2F2",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
        display: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(71, 85, 105, 0.15)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(148, 163, 184, 0.1), transparent 50%), radial-gradient(circle at bottom right, rgba(71, 85, 105, 0.08), transparent 50%)",
      },
    },
  },
  plugins: [],
};

