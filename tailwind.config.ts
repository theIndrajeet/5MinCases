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
        // 5 Min Case Brand Colors
        'dark-authority': '#051F20',
        'deep-emerald': '#0B2B26',
        'slate-green': '#163832',
        'muted-teal': '#235547',
        'soft-sage': '#8EB9B8',
        'pale-mint': '#DAF1DE',
      },
      fontFamily: {
        'merriweather': ['Merriweather', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'noto': ['Noto Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
