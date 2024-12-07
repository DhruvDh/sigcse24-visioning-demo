import { motion } from "framer-motion";

export type MotionDivProps = {
  children: React.ReactNode;
  className?: string;
  initial?: { opacity?: number; y?: number; x?: number } | string;
  animate?: { opacity?: number; y?: number; x?: number } | string;
  exit?: { opacity?: number; y?: number; x?: number } | string;
  transition?: { delay?: number; duration?: number };
  variants?: Record<string, any>;
  custom?: any;
};

export const MotionDiv = motion.div as React.FC<MotionDivProps>;

export const containerAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
} as const;

export const itemAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
} as const; 