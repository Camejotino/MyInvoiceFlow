import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F89E1A',
          light: '#F3B85E',
          dark: '#1F1E1D',
        },
        neutral: {
          light: '#ECD8B6',
          DEFAULT: '#74654F',
          dark: '#1F1E1D',
          white: '#FEFEFE',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
