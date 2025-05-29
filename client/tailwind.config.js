/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pure-white': '#FFFFFF',
        'light-blue': '#E6F3FA',
        'pure-black': '#000000',
      },
    },
  },
  plugins: [],
}