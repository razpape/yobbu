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
        primary: {
          light: '#D4E8F4',
          mid:   '#6FBDE0',
          DEFAULT: '#52B5D9',
          dark:  '#3A8FB8',
        },
        accent: {
          light: '#E8DCCE',
          mid:   '#D4A574',
          DEFAULT: '#C9975C',
          dark:  '#A85A3A',
        },
        secondary: {
          light: '#DCC8BA',
          mid:   '#A85A3A',
          DEFAULT: '#A85A3A',
          dark:  '#8B4A2E',
        },
        gold: {
          light: '#EDD8C4',
          mid:   '#D4A574',
          DEFAULT: '#C9975C',
          dark:  '#A85A3A',
        },
        green: {
          light: '#D7E8DC',
          mid:   '#5BB878',
          DEFAULT: '#4A9B5F',
          dark:  '#387949',
        },
        sand: {
          DEFAULT: '#F9FAFB',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
        },
        ink: {
          DEFAULT: '#2D3436',
          200: '#6B7280',
          300: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
}
