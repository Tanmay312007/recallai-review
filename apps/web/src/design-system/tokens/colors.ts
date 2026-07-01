export const colors = {
  background: {
    base: 'var(--bg-base)',
    surface: 'var(--bg-surface)',
    elevated: 'var(--bg-elevated)',
    overlay: 'var(--bg-overlay)',
  },
  foreground: {
    primary: 'var(--text-primary)',
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
  focus: 'var(--focus-ring)',
} as const;
