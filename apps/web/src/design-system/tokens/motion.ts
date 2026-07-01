export const motion = {
  duration: {
    instant: 50,
    fast: 100,
    normal: 150,
    slow: 220,
    deliberate: 300,
  },
  curve: {
    default: [0.2, 0.0, 0.0, 1.0] as const,
    enter: [0.0, 0.0, 0.2, 1.0] as const,
    exit: [0.2, 0.0, 0.0, 1.0] as const,
    spring: { stiffness: 400, damping: 30, mass: 1 } as const,
    springGentle: { stiffness: 300, damping: 25, mass: 1 } as const,
  },
} as const;
