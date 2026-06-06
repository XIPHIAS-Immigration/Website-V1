// tailwind.config.ts
import type { Config } from "tailwindcss";

// make TS happy about the theme resolver used in typography extension
type ThemeResolver = (path: string) => string;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // was "./markdown/**/*.{md,mdx}" — your MDX actually lives in /content
    "./content/**/*.{md,mdx}",
  ],

  future: { hoverOnlyWhenSupported: true },

  safelist: [
    "prose",
    "prose-invert",
    {
      pattern:
        /(bg|text|border|ring)-(primary|secondary|success|warning|error)/,
    },
    { pattern: /(bg|text|border)-(darkmode|dark_border|dark_bg|dark_text)/ },
  ],

  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
      fontFamily: {
        raleway: ["var(--font-raleway)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "screen-xl": "75rem",
        "screen-2xl": "83.75rem",
      },
      boxShadow: {
        "cause-shadow": "0px 4px 17px 0px #00000008",
      },
      spacing: {
        "6.25": "6.25rem",
        "70%": "70%",
        "40%": "40%",
        "30%": "30%",
        "80%": "80%",
        8.5: "8.5rem",
        50: "50rem",
        51: "54.375rem",
        25: "35.625rem",
        29: "28rem",
        120: "120rem",
        45: "45rem",
        94: "22.5rem",
        85: "21rem",
        3.75: "3.75rem",
      },
      inset: {
        "5%": "5%",
        "35%": "35%",
        safe: "env(safe-area-inset-bottom)",
      },
      zIndex: {
        1: "1",
        2: "2",
        999: "999",
      },
      colors: {
        primary: "#1c57b4",
        secondary: "#e1b923",
        light_bg: "#ffffff",
        light_text: "#1a1a1a",
        dark_bg: "#121212",
        dark_text: "#e4e4e4",
        midnight_text: "#263238",
        muted: "#d8dbdb",
        error: "#CF3127",
        warning: "#F7931A",
        light_grey: "#505050",
        grey: "#F5F7FA",
        dark_grey: "#1E2229",
        border: "#E1E1E1",
        success: "#3cd278",
        section: "#737373",
        darkmode: "#0d1117",
        darklight: "#18212b",
        dark_border: "#959595",
        tealGreen: "#477E70",
        charcoalGray: "#666C78",
        deepSlate: "#282C36",
        slateGray: "#2F3543",
      },
      fontSize: {
        86: ["5.375rem", { lineHeight: "1.2" }],
        76: ["4.75rem", { lineHeight: "1.2" }],
        70: ["4.375rem", { lineHeight: "1.2" }],
        54: ["3.375rem", { lineHeight: "1.2" }],
        44: ["2.75rem", { lineHeight: "1.3" }],
        40: ["2.5rem", { lineHeight: "3rem" }],
        36: ["2.25rem", { lineHeight: "2.625rem" }],
        30: ["1.875rem", { lineHeight: "2.25rem" }],
        28: ["1.75rem", { lineHeight: "2.25rem" }],
        24: ["1.5rem", { lineHeight: "2rem" }],
        22: ["1.375rem", { lineHeight: "2rem" }],
        21: ["1.3125rem", { lineHeight: "1.875rem" }],
        18: ["1.125rem", { lineHeight: "1.5rem" }],
        17: ["1.0625rem", { lineHeight: "1.4875rem" }],
        16: ["1rem", { lineHeight: "1.6875rem" }],
        14: ["0.875rem", { lineHeight: "1.225rem" }],
      },
      backgroundImage: {
        start: "url('/images/work/bg-start.png')",
        perk: "url('/images/perks/perk-bg.png')",
      },
      blur: {
        220: "220px",
        400: "400px",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        shine: "shine 2s linear infinite",
      },

      // brand-aware prose styles
      typography: ({ theme }: { theme: ThemeResolver }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.light_text"),
            "--tw-prose-headings": theme("colors.midnight_text"),
            "--tw-prose-links": theme("colors.primary"),
            "--tw-prose-bold": theme("colors.light_text"),
            "--tw-prose-hr": theme("colors.border"),
            "--tw-prose-quotes": theme("colors.light_text"),
            "--tw-prose-code": theme("colors.deepSlate"),
            "--tw-prose-pre-code": theme("colors.light_text"),
          },
        },
        invert: {
          css: {
            "--tw-prose-body": theme("colors.dark_text"),
            "--tw-prose-headings": theme("colors.dark_text"),
            "--tw-prose-links": theme("colors.secondary"),
            "--tw-prose-bold": theme("colors.dark_text"),
            "--tw-prose-hr": theme("colors.dark_border"),
            "--tw-prose-quotes": theme("colors.dark_text"),
            "--tw-prose-code": theme("colors.grey"),
            "--tw-prose-pre-code": theme("colors.dark_text"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
