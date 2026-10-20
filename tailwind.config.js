/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', '"Courier New"', 'monospace'],
      },
      colors: {
        /* Brand */
        brand: {
          DEFAULT: '#4f46e5',
          hover:   '#4338ca',
          light:   '#eef2ff',
          border:  '#c7d2fe',
        },
        /* Surfaces */
        surface: {
          DEFAULT: '#ffffff',
          raised:  '#f9f8f6',
          overlay: '#f0ede8',
          muted:   '#f4f3f1',
        },
        /* Typography */
        ink:    '#18181b',
        muted:  '#71717a',
        subtle: '#a1a1aa',
        /* Semantic — success/teal */
        teal: {
          DEFAULT: '#0f766e',
          hover:   '#0d9488',
          light:   '#f0fdfa',
          border:  '#99f6e4',
        },
        /* Semantic — warning/amber */
        amber: {
          DEFAULT: '#b45309',
          light:   '#fffbeb',
          border:  '#fde68a',
        },
        /* Semantic — danger/rose (coral kept as alias) */
        coral: {
          DEFAULT: '#be123c',
          hover:   '#9f1239',
          light:   '#fff1f2',
          border:  '#fecdd3',
        },
        border: '#e8e6e3',
      },
      borderColor: {
        DEFAULT: '#e8e6e3',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(24,24,27,0.06), 0 1px 2px rgba(24,24,27,0.04)',
        hover:   '0 4px 16px rgba(24,24,27,0.08), 0 2px 6px rgba(24,24,27,0.05)',
        brand:   '0 4px 14px rgba(79,70,229,0.28)',
        success: '0 2px 8px rgba(15,118,110,0.22)',
      },
      borderRadius: {
        card: '0.875rem',
        panel: '0.625rem',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79,70,229,0.25)' },
          '50%':       { boxShadow: '0 0 0 6px rgba(79,70,229,0)' },
        },
        'gf-shimmer': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.55' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shimmer:      'gf-shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
