/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d8d6d1",
        input: "#d8d6d1",
        ring: "#0f766e",
        background: "#f6f2ea",
        foreground: "#1f2937",
        primary: {
          DEFAULT: "#0f766e",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "#f59e0b",
          foreground: "#1f2937",
        },
        muted: {
          DEFAULT: "#ece4d7",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#dbeafe",
          foreground: "#1e3a8a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#fef2f2",
        },
        card: {
          DEFAULT: "#fffdf9",
          foreground: "#1f2937",
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
        soft: "0 18px 60px -24px rgba(15, 118, 110, 0.35)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(245, 158, 11, 0.24), transparent 35%), radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.16), transparent 30%)",
      },
    },
  },
  plugins: [],
};

