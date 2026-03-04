import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        white: '#F5F5F0',
        accent: '#C8FF00',
        'grey-dark': '#2A2A2A',
        'grey-mid': '#6B6B6B',
        'grey-light': '#E8E8E3'
      },
      boxShadow: {
        card: '0 2px 20px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        sharp: '4px'
      }
    }
  },
  plugins: []
};

export default config;
