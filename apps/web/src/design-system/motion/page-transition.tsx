'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface PageTransitionProps extends HTMLMotionProps<'div'> {
  duration?: number;
}

export function PageTransition({ children, duration = 0.22, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration, ease: [0.2, 0.0, 0.0, 1.0] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
