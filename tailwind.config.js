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
      }
    },
  },
  plugins: [],
}

