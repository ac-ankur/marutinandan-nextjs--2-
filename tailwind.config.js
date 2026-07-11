/** @type {import('tailwindcss').Config} */
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
          DEFAULT: "#FBF3DF",
          deep: "#F3E7C6",
          paper: "#FFFDF7",
        },
        ink: "#241B10",
        pine: {
          950: "#0F2B1E",
          900: "#153826",
          800: "#1B4530",
          700: "#215539",
          600: "#2C6C48",
        },
        gold: {
          DEFAULT: "#D3A02E",
          light: "#F0CB6E",
          deep: "#A97C1C",
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
