import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v3 configuration (PROMPT §3: Tailwind CSS v3 + custom design
 * tokens using OKLCH color system per §8.1).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    colors: {
      // ── OKLCH Design Tokens (PROMPT §8.1) ──────────────────────────
      // These mirror the CSS custom properties in globals.css and give
      // Tailwind utility classes like bg-surface, text-brand, etc.
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
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    extend: {
      // Additional Tailwind extensions as needed per Vol III (UX spec).
    },
  },
  plugins: [],
};

export default config;
