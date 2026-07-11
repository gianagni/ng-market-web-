import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'letter-pop': {
          '0%': { opacity: '0', transform: 'scale(0) rotate(-180deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'letter-pop': 'letter-pop 0.5s cubic-bezier(0.68,-0.55,0.265,1.55) forwards',
        'bar-fill': 'bar-fill 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;