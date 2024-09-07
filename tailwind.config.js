/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        '30': '7.5rem',
        '38': '9.5rem',
      }
    },
  },
  plugins: [],
}

