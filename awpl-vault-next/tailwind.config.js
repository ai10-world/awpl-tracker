/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        bg:       'var(--bg)',
        bg2:      'var(--bg2)',
        bg3:      'var(--bg3)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        accent:   'var(--accent)',
        accent2:  'var(--accent2)',
        gold:     'var(--gold)',
        gold2:    'var(--gold2)',
        muted:    'var(--text2)',
        faint:    'var(--text3)',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
        'fade-up':    'fadeUp 0.3s ease forwards',
        'shake':      'shake 0.4s ease',
      },
      keyframes: {
        glowPulse: {
          from: { boxShadow: '0 0 30px rgba(108,92,231,0.25), 0 0 60px rgba(255,215,0,0.06)' },
          to:   { boxShadow: '0 0 60px rgba(108,92,231,0.45), 0 0 100px rgba(255,215,0,0.14)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
