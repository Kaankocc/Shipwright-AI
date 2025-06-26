/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
      },
      animation: {
        'bounce-delay-100': 'bounce 1s infinite 100ms',
        'bounce-delay-200': 'bounce 1s infinite 200ms',
      },
    },
  },
  plugins: [],
} 