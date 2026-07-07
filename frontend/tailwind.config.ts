import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05080d",
        surface: "#0a0f18",
        surfaceAlt: "#0f1622",
        border: "#1b2b3d",
        // neon mint = positive / bullish / active
        accent: "#2bffb3",
        // cyan = structural chrome, headings, glow
        primary: "#38e8ff",
        danger: "#ff3b6b",
        warning: "#ffc247",
        muted: "#5f7a99",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ['"Orbitron"', '"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        "glow-accent": "0 0 12px rgba(43,255,179,0.35), 0 0 2px rgba(43,255,179,0.6)",
        "glow-primary": "0 0 14px rgba(56,232,255,0.35), 0 0 2px rgba(56,232,255,0.6)",
        "glow-danger": "0 0 12px rgba(255,59,107,0.35)",
        panel: "0 0 0 1px rgba(56,232,255,0.08), 0 8px 40px -12px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.03)",
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { opacity: "1", boxShadow: "0 0 8px rgba(43,255,179,0.7)" },
          "50%": { opacity: "0.45", boxShadow: "0 0 2px rgba(43,255,179,0.3)" },
        },
        flicker: {
          "0%,19%,21%,23%,25%,54%,56%,100%": { opacity: "1" },
          "20%,24%,55%": { opacity: "0.55" },
        },
        gridMove: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "44px 44px" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
      },
      animation: {
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        flicker: "flicker 4s linear infinite",
        gridMove: "gridMove 3s linear infinite",
        sweep: "sweep 2.4s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
