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
        brand:  { DEFAULT: '#6366f1', hover: '#4f46e5', light: '#eef2ff', border: '#c7d2fe' },
        teal:   { DEFAULT: '#0d9488', hover: '#0f766e', light: '#f0fdfa', border: '#99f6e4' },
        amber:  { DEFAULT: '#d97706', light: '#fffbeb', border: '#fde68a' },
        coral:  { DEFAULT: '#e11d48', light: '#fff1f2', border: '#fecdd3' },
        violet: { DEFAULT: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe' },
        warm: {
          bg:      '#fffbf5',
          'bg-2':  '#fdf8f0',
          surface: '#ffffff',
          's2':    '#fdf8f0',
          border:  '#e7e5e4',
          ink:     '#1c1917',
          muted:   '#78716c',
          subtle:  '#a8a29e',
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
