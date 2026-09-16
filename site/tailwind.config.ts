import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // navy = cor escura estrutural (hero, footer, botões, headings)
        navy: '#1a1a1a',
        // gold = vermelho da marca Santos Press
        gold: '#b5282c',
      },
      fontFamily: {
        sans: ['var(--font-lato)', 'Lato', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
