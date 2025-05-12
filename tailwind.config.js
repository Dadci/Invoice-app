/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'sm': '375px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
      },
      colors: {
        // Light mode colors
        'light-bg': '#F8F8FB',
        'light-card': '#FFFFFF',
        'light-text': '#0C0E16',
        'light-text-secondary': '#888EB0',
        'light-border': '#DFE3FA',
        'light-input': '#FFFFFF',

        // Dark mode colors
        'dark-bg': '#141625',
        'dark-card': '#1E2139',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#DFE3FA',
        'dark-border': '#252945',
        'dark-input': '#252945',
      },
    },
  },
  plugins: [],
}

