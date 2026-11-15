import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F3F5F9",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#13161D",
          hover: "#1F2937",
        },
        noon: {
          blue: "#2563EB",
          lightBlue: "#EFF6FF",
          pillBlue: "#3B82F6",
          pillSky: "#93C5FD",
          green: "#10B981",
          lightGreen: "#DCFCE7",
          pillGreen: "#84CC16",
          amber: "#F59E0B",
          lightAmber: "#FEF3C7",
          emergency: "#EF4444",
          emergencyDark: "#DC2626",
          darkBg: "#0F172A",
          cardBorder: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'float': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
export default config;
