export const elevation = {
  none: 'none',
  low: '0 1px 2px 0 rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.10)',
  medium: '0 4px 6px -1px rgb(0 0 0 / 0.20), 0 2px 4px -2px rgb(0 0 0 / 0.15)',
  high: '0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.20)',
  overlay: '0 20px 25px -5px rgb(0 0 0 / 0.30), 0 8px 10px -6px rgb(0 0 0 / 0.20)',
} as const;

export type ElevationLevel = keyof typeof elevation;
