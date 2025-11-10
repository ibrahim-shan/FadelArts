"use client";

import { useEffect, useRef } from "react";
// Ensure you've installed Lenis: npm i lenis
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll() {
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      smoothWheel: true,
      wheelMultiplier: 1.5,
      touchMultiplier: 2,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    const raf = (time: number) => {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    };
    rafId.current = requestAnimationFrame(raf);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lenis.destroy();
    };
  }, []);

  return null;
}
