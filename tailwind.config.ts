// tailwind.config.ts
import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D97757',
          foreground: '#FFFFFF',
          light: 'rgba(217, 119, 87, 0.1)'
        }
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)'],
        serif: ['var(--font-plex-serif)'],
        mono: ['var(--font-plex-mono)'],
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            'pre': {
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
            },
            'code': {
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            color: '#1e293b',
            h1: { color: '#1e293b' },
            h2: { color: '#1e293b' },
            h3: { color: '#1e293b' },
            h4: { color: '#1e293b' },
            strong: { color: '#1e293b' },
            blockquote: { 
              color: '#475569',
              borderLeftColor: '#D97757'
            },
            a: {
              color: '#D97757',
              '&:hover': {
                color: '#C05E3E'
              }
            }
          }
        }
      }
    },
  },
  plugins: [typography],
};

export default config;
