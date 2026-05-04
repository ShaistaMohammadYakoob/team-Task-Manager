/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 18px 60px rgba(14, 165, 233, 0.18)',
        soft: '0 18px 50px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
