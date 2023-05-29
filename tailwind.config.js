/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./src/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        active: "#FFD780",
        hover: "#80ACFF"
      },
      screens: {
        "3xl": "1700px"
        // => @media (min-width: 1700px) { ... }
      }
    },
  },
  plugins: [],
}

