/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional IEP (rojo). Fase 1: se usa en la UI de evaluación
        // nueva; el barrido completo de los literales blue-* es de Fase 3.
        primary: {
          50: '#fff1ef',
          100: '#ffe1dc',
          200: '#ffc4b9',
          300: '#ff9c88',
          400: '#fb6a4d',
          500: '#f93319',
          600: '#d92c16',
          700: '#b0210f',
          800: '#8a1a0d',
          900: '#7a1608',
        },
        secondary: {
          50: '#faf5ff',
          500: '#a78bfa',
          600: '#9333ea',
          700: '#7e22ce',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
