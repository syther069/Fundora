/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        inter:   ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        brand:  { DEFAULT: '#1A3F75', hover: '#122D54', light: '#EBF2F7', border: '#A7C6D8' },
        midnight: { DEFAULT: '#00002A' },
        slate:    { DEFAULT: '#4F7897', light: '#64748B' },
        mist:     { DEFAULT: '#A7C6D8' },
        pale:     { DEFAULT: '#D1E2EC' },
        teal:   { DEFAULT: '#0F766E', hover: '#0D5F58', light: '#F0FDFA', border: '#99F6E4' },
        amber:  { DEFAULT: '#B45309', light: '#FFFBEB', border: '#FDE68A' },
        coral:  { DEFAULT: '#BE123C', light: '#FFF1F2', border: '#FECDD3' },
        violet: { DEFAULT: '#6D28D9', light: '#F5F3FF', border: '#DDD6FE' },
        warm: {
          bg:      '#F7F8F6',
          'bg-2':  '#EFF3F6',
          surface: '#ffffff',
          raised:  '#F9FAFB',
          's2':    '#EFF3F6',
          border:  '#E2E8F0',
          strong:  '#A7C6D8',
          ink:     '#00002A',
          muted:   '#4F7897',
          subtle:  '#64748B',
        },
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'warm-md': '0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)',
        'warm-lg': '0 12px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.05)',
        'brand':   '0 4px 14px rgba(99,102,241,.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(99,102,241,.15)' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.6s ease-in-out infinite',
        'fade-in':   'fade-in 0.25s ease forwards',
        'pulse-glow':'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
