'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface SlideInProps extends HTMLMotionProps<'div'> {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
}

export function SlideIn({
  children,
  direction = 'up',
  distance = 8,
  duration = 0.15,
  delay = 0,
  ...props
}: SlideInProps) {
  const offsets = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offsets[direction] }}
      transition={{ duration, delay, ease: [0.2, 0.0, 0.0, 1.0] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
