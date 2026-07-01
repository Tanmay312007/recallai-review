'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface ScaleInProps extends HTMLMotionProps<'div'> {
  duration?: number;
  delay?: number;
}

export function ScaleIn({ children, duration = 0.12, delay = 0, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration, delay, ease: [0.2, 0.0, 0.0, 1.0] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
