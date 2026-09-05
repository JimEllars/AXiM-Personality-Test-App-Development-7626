/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: '#5ee4c4',
        blue: '#2c73bd',
        surface: 'rgba(7, 17, 31, 0.76)',
        'surface-elevated': 'rgba(12, 29, 42, 0.82)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 55px rgba(0, 0, 0, 0.16)',
        elevated: '0 28px 90px rgba(0, 0, 0, 0.26)',
        focus: '0 0 0 3px rgba(98, 229, 197, 0.2)',
      }
    },
  },
  plugins: [],
}