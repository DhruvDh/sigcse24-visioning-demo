import { motion } from "framer-motion";
import { clsx } from "clsx";
import { PropsWithChildren } from "react";

const fadeInAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

interface TypographyProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

// Display - Large, impactful headlines
export const Display = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.h1 : "h1";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-serif text-5xl md:text-6xl leading-tight tracking-tight",
        "font-medium",
        className
      )}
    >
      {children}
    </Component>
  );
};

// H1 - Primary Heading
export const H1 = ({
  children,
  className,
  animate = true,
  style,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.h1 : "h1";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-serif text-4xl md:text-5xl leading-tight",
        "font-medium mb-6",
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
};

// H2 - Secondary Heading
export const H2 = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.h2 : "h2";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-serif text-3xl md:text-4xl leading-tight",
        "font-medium mb-4",
        className
      )}
    >
      {children}
    </Component>
  );
};

// H3 - Tertiary Heading
export const H3 = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.h3 : "h3";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-serif text-2xl md:text-3xl leading-tight",
        "font-medium mb-3",
        className
      )}
    >
      {children}
    </Component>
  );
};

// H4 - Quaternary Heading
export const H4 = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.h4 : "h4";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-serif text-xl md:text-2xl leading-tight",
        "font-medium mb-2",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Large Body Text
export const BodyLarge = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.p : "p";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-sans text-xl md:text-2xl leading-relaxed",
        "mb-4",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Regular Body Text
export const Body = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.p : "p";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx("font-sans text-lg leading-relaxed", "mb-4", className)}
    >
      {children}
    </Component>
  );
};

// Subtle Text
export const Subtle = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.p : "p";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-sans text-sm leading-relaxed",
        "text-gray-600",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Code Text
export const Code = ({
  children,
  className,
  animate = true,
}: PropsWithChildren<TypographyProps>) => {
  const Component = animate ? motion.code : "code";
  return (
    <Component
      {...(animate ? fadeInAnimation : {})}
      className={clsx(
        "font-mono text-sm bg-gray-100",
        "px-1.5 py-0.5 rounded",
        className
      )}
    >
      {children}
    </Component>
  );
};
