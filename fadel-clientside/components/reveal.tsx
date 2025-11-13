"use client";

import { motion, type Variants } from "framer-motion";
import * as React from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  mode?: "inview" | "mount";
};

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  mode = "inview",
}: RevealProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Before hydration, render plain content to avoid any hidden state
  if (!mounted) {
    const Fallback = as as React.ElementType;
    return <Fallback className={className}>{children}</Fallback>;
  }

  const Comp = motion[as as keyof typeof motion] as React.ElementType;

  const common = {
    className,
    variants,
    initial: "hidden" as const,
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay },
  };

  if (mode === "mount") {
    return (
      <Comp {...common} animate="show">
        {children}
      </Comp>
    );
  }

  return (
    <Comp {...common} whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      {children}
    </Comp>
  );
}
