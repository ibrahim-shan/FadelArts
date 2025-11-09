"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Slide = {
  src: string;
  /**
   * Title supports a manual line break using the pipe character `|`.
   * Example: "Curated Art|For Modern Spaces" renders on two lines.
   */
  title: string;
  cta?: { label: string; href: string };
};

const DEFAULT_SLIDES: Slide[] = [
  {
    src: "/hero-1.svg",
    title: "Curated Art|For Modern Spaces",
    cta: { label: "Explore Gallery", href: "/gallery" },
  },
  {
    src: "/hero-2.svg",
    title: "Bring Character|To Your Walls",
    cta: { label: "Shop Now", href: "/shop" },
  },
  {
    src: "/hero-3.svg",
    title: "Collect The|Exceptional",
    cta: { label: "New Arrivals", href: "/gallery?sort=new" },
  },
];

export function Hero({
  slides = DEFAULT_SLIDES,
  interval = 5000,
  id = "hero",
}: {
  slides?: Slide[];
  interval?: number;
  id?: string;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-advance
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(next, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, interval]);

  const transition = useMemo(
    () => ({ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as any }),
    []
  );

  return (
    <section id={id} className="relative w-full" aria-label="Featured artwork">
      <div className="relative h-[70vh] w-full overflow-hidden rounded-none">
        <AnimatePresence initial={false}>
          {slides.map((slide, i) =>
            i === index ? (
              <motion.div
                key={slide.src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2 }}
                transition={transition}
              >
                <Image
                  src={slide.src}
                  alt="Featured artwork"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Overlay content */}
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            key={index}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={transition}
            className="text-center px-6"
          >
            <h1
              className="mb-6 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {slides[index]?.title.split("|").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            {slides[index]?.cta ? (
              <Button asChild size="lg" className="shadow-brand-md">
                <a href={slides[index].cta!.href}>{slides[index].cta!.label}</a>
              </Button>
            ) : null}
          </motion.div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-base ${
                i === index
                  ? "bg-primary w-7"
                  : "bg-muted w-2.5 hover:bg-accent"
              }`}
            />
          ))}
        </div>

        {/* Prev/Next hit areas (visually subtle) */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            aria-label="Previous slide"
            onClick={prev}
            className="h-full w-12 hover:bg-black/10 transition-base"
          />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            aria-label="Next slide"
            onClick={next}
            className="h-full w-12 hover:bg-black/10 transition-base"
          />
        </div>
      </div>
    </section>
  );
}
