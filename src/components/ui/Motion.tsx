import { motion } from "framer-motion";

export type MotionDivProps = {
  children: React.ReactNode;
  className?: string;
  initial?: { opacity?: number; y?: number; x?: number };
  animate?: { opacity?: number; y?: number; x?: number };
  exit?: { opacity?: number; y?: number; x?: number };
  transition?: { delay?: number; duration?: number };
};

export const MotionDiv = motion.div as React.FC<MotionDivProps>;

export const containerAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const itemAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}; 