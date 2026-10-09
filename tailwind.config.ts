import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────────────────────
        'brand-dark':   '#0b0e14',   // bg-brand-dark   — main page bg
        'brand-card':   '#0A1929',   // bg-brand-card   — card surfaces
        'brand-deep':   '#040D18',   // bg-brand-deep   — modals, hero, footer

        // ── Accent ───────────────────────────────────────────────────────
        'accent':       'var(--color-accent)',   // bg-accent / text-accent / border-accent
        'accent-hover': '#4B83F5',   // hover:bg-accent-hover

        // ── Text ─────────────────────────────────────────────────────────
        'primary':  '#f8fafc',       // text-primary
        'muted':    '#94a3b8',       // text-muted

        // ── Border ───────────────────────────────────────────────────────
        'border-base': '#1e2530',    // border-border-base
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'eyebrow': ['11px', { letterSpacing: '0.15em', lineHeight: '1' }],
      },

      backgroundImage: {
        'gradient-logo': 'linear-gradient(135deg, #7C3AED, #3B82F6)',
        'gradient-logo-text': 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
      },

      borderRadius: {
        'card': '16px',
        'btn':  '10px',
      },

      boxShadow: {
        'accent-glow': '0 0 32px rgba(139, 92, 246, 0.18)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3)',
      },

      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '350ms',
      },

      animation: {
        'grid-drift': 'gridDrift 20s linear infinite',
        'counter-in': 'counterIn 0.6s ease-out forwards',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
      },

      keyframes: {
        gridDrift: {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(40px, 40px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        counterIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
