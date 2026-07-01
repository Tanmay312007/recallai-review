'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface FadeInProps extends HTMLMotionProps<'div'> {
  duration?: number;
  delay?: number;
}

export function FadeIn({ children, duration = 0.15, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay, ease: [0.2, 0.0, 0.0, 1.0] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
