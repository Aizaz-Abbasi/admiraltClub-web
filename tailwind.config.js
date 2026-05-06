
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#2563EB', // Bright accent blue from prompt
          700: '#334e68',
          800: '#1E3A5F', // Medium navy
          900: '#0F1B2D', // Dark navy
        },
        gold: {
          50: '#fbf8f1',
          100: '#f5ecdb',
          200: '#ebd5b0',
          300: '#e0bc81',
          400: '#d5a556',
          500: '#C9A84C', // Primary gold
          600: '#b3923a',
          700: '#8f722a',
          800: '#6f5723',
          900: '#5c4820',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
