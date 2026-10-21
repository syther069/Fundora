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
        brand:  { DEFAULT: '#4F46E5', hover: '#4338CA', light: '#EEF2FF', border: '#C7D2FE' },
        teal:   { DEFAULT: '#0F766E', hover: '#0D5F58', light: '#F0FDFA', border: '#99F6E4' },
        amber:  { DEFAULT: '#B45309', light: '#FFFBEB', border: '#FDE68A' },
        coral:  { DEFAULT: '#BE123C', light: '#FFF1F2', border: '#FECDD3' },
        violet: { DEFAULT: '#6D28D9', light: '#F5F3FF', border: '#DDD6FE' },
        warm: {
          bg:      '#fffbf5',
          'bg-2':  '#fdf8f0',
          surface: '#ffffff',
          raised:  '#FAFAF8',
          's2':    '#fdf8f0',
          border:  '#E8E6E3',
          strong:  '#D5D3D0',
          ink:     '#18181B',
          muted:   '#71717A',
          subtle:  '#A1A1AA',
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
