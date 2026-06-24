/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020c1b',
          900: '#0A192F',
          800: '#112240',
          700: '#233554',
          300: '#8892b0',
          100: '#ccd6f6',
        },
        electric: {
          green: '#00E676',
          greenHover: '#00c853',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(0, 230, 118, 0.45)',
        'glow-lg': '0 0 25px rgba(0, 230, 118, 0.65)',
      }
    },
  },
  plugins: [],
}
