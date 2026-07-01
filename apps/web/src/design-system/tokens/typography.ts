export const typography = {
  display: { size: '2.5rem', lineHeight: '1.1', weight: '700', letterSpacing: '-0.025em' },
  heading1: { size: '2rem', lineHeight: '1.2', weight: '700', letterSpacing: '-0.02em' },
  heading2: { size: '1.5rem', lineHeight: '1.3', weight: '600', letterSpacing: '-0.015em' },
  heading3: { size: '1.25rem', lineHeight: '1.4', weight: '600', letterSpacing: '-0.01em' },
  heading4: { size: '1.125rem', lineHeight: '1.4', weight: '600', letterSpacing: '-0.005em' },
  section: { size: '0.8125rem', lineHeight: '1.25', weight: '600', letterSpacing: '0.05em' },
  title: { size: '0.9375rem', lineHeight: '1.4', weight: '500', letterSpacing: '0em' },
  body: { size: '0.875rem', lineHeight: '1.5', weight: '400', letterSpacing: '0em' },
  bodySmall: { size: '0.8125rem', lineHeight: '1.5', weight: '400', letterSpacing: '0em' },
  caption: { size: '0.75rem', lineHeight: '1.4', weight: '400', letterSpacing: '0em' },
  label: { size: '0.8125rem', lineHeight: '1.25', weight: '500', letterSpacing: '0em' },
  mono: { size: '0.8125rem', lineHeight: '1.5', weight: '400', letterSpacing: '-0.01em' },
  monoSmall: { size: '0.75rem', lineHeight: '1.4', weight: '400', letterSpacing: '-0.01em' },
} as const;

export type TypographyVariant = keyof typeof typography;
