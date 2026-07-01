import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      background: {
        DEFAULT: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
      },
      foreground: {
        DEFAULT: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        disabled: 'var(--text-disabled)',
      },
      brand: {
        DEFAULT: 'var(--brand)',
        hover: 'var(--brand-hover)',
        subtle: 'var(--brand-subtle)',
      },
      semantic: {
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      rating: {
        again: 'var(--rating-again)',
        hard: 'var(--rating-hard)',
        good: 'var(--rating-good)',
        easy: 'var(--rating-easy)',
      },
      border: {
        DEFAULT: 'var(--border)',
        hover: 'var(--border-hover)',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      display: ['2.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.025em' }],
      h1: ['2rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
      h2: ['1.5rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.015em' }],
      h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.01em' }],
      h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.005em' }],
      section: ['0.8125rem', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '0.05em' }],
      title: ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }],
      base: ['0.875rem', { lineHeight: '1.5' }],
      sm: ['0.8125rem', { lineHeight: '1.5' }],
      caption: ['0.75rem', { lineHeight: '1.4' }],
      label: ['0.8125rem', { lineHeight: '1.25', fontWeight: '500' }],
    },
    extend: {
      boxShadow: {
        low: 'var(--shadow-low)',
        medium: 'var(--shadow-medium)',
        high: 'var(--shadow-high)',
        overlay: 'var(--shadow-overlay)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      ringColor: {
        DEFAULT: 'var(--focus-ring)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in': 'slideIn 150ms ease-out',
        'scale-in': 'scaleIn 120ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      zIndex: {
        header: '50',
        sidebar: '40',
        overlay: '60',
        modal: '70',
        popover: '80',
        tooltip: '90',
        toast: '100',
      },
      transitionDuration: {
        fast: '100ms',
        DEFAULT: '150ms',
        slow: '220ms',
        deliberate: '300ms',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
        'enter': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'exit': 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      },
    },
  },
  plugins: [],
};

export default config;
