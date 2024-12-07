import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 * This allows for conditional classes and prevents duplicate utility classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 