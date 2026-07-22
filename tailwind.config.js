/** @type {import('tailwindcss').Config} */
const alpha = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: alpha("cream"),
          deep: alpha("cream-deep"),
          paper: alpha("cream-paper"),
        },
        ink: alpha("ink"),
        pine: {
          950: alpha("pine-950"),
          900: alpha("pine-900"),
          800: alpha("pine-800"),
          700: alpha("pine-700"),
          600: alpha("pine-600"),
        },
        gold: {
          DEFAULT: alpha("gold"),
          light: alpha("gold-light"),
          deep: alpha("gold-deep"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        grain: "url('/images/grain.svg')",
      },
    },
  },
  plugins: [],
};
