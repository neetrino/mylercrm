import type { Config } from "tailwindcss";

/** Logo samples: teal #2aa6af, sun #fed14b, pine #a7ce44, ice #aadcdf. */
const channel = (r: number, g: number, b: number) =>
  `rgb(${r} ${g} ${b} / <alpha-value>)`;

const teal = {
  50: channel(242, 250, 250),
  100: channel(217, 243, 244),
  200: channel(183, 230, 233),
  300: channel(132, 210, 215),
  400: channel(74, 184, 192),
  500: channel(42, 166, 175),
  600: channel(20, 104, 112),
  700: channel(15, 85, 92),
  800: channel(16, 68, 74),
  900: channel(18, 62, 68),
  950: channel(12, 48, 52),
};

const pine = {
  50: channel(247, 251, 234),
  100: channel(237, 246, 208),
  200: channel(217, 236, 163),
  300: channel(192, 222, 110),
  400: channel(167, 206, 68),
  500: channel(143, 184, 46),
  600: channel(111, 147, 31),
  700: channel(86, 113, 27),
  800: channel(70, 89, 27),
  900: channel(59, 75, 28),
  950: channel(30, 41, 12),
};

const sun = {
  50: channel(255, 251, 235),
  100: channel(255, 244, 199),
  200: channel(255, 232, 138),
  300: channel(254, 209, 75),
  400: channel(245, 193, 42),
  500: channel(227, 168, 13),
  600: channel(196, 132, 8),
  700: channel(156, 99, 11),
  800: channel(128, 78, 16),
  900: channel(107, 65, 19),
  950: channel(62, 33, 6),
};

const ink = {
  50: channel(246, 250, 250),
  100: channel(236, 243, 243),
  200: channel(214, 228, 228),
  300: channel(186, 206, 207),
  400: channel(132, 156, 158),
  500: channel(96, 120, 122),
  600: channel(72, 94, 96),
  700: channel(54, 72, 74),
  800: channel(36, 50, 52),
  900: channel(22, 34, 36),
  950: channel(12, 22, 24),
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        blue: teal,
        slate: teal,
        gray: ink,
        green: pine,
        emerald: pine,
        yellow: sun,
        amber: sun,
      },
      boxShadow: {
        card: "0 16px 40px -24px rgb(12 48 52 / 0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
