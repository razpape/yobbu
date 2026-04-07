/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      colors: {
        gold: {
          light: '#FDF3E3',
          mid:   '#F0A830',
          DEFAULT: '#C8810A',
          dark:  '#8A5800',
        },
        forest: {
          light: '#E8F4ED',
          DEFAULT: '#1A5C38',
          mid:   '#2E8B57',
        },
        sand: {
          DEFAULT: '#FDFAF6',
          100: '#F5F0E8',
          200: '#E8E0D4',
          300: '#D4C8B8',
        },
        ink: {
          DEFAULT: '#1C1A17',
          200: '#6B6560',
          300: '#A09890',
        },
      },
    },
  },
  plugins: [],
}
