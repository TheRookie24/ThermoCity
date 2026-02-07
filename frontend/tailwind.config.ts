import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        infra: {
          bg: "#0b1220", // base background
          panel: "#070b14", // panels
          surface: "#0d1526", // elevated surfaces
          border: "#1b2a44",
          text: "#e5e7eb",
          muted: "#9aa4b2",
          faint: "#6b7280",
          accent: "#2563eb",
          success: "#16a34a",
          warn: "#f59e0b",
          danger: "#dc2626",
        },
      },
      borderRadius: {
        infra: "14px",
      },
      boxShadow: {
        infra: "0 0 0 1px rgba(27,42,68,0.9)",
        infra2: "0 10px 30px rgba(0,0,0,0.35)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
