"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/reveal";

export default function ExploreByStyle({ id = "styles" }: { id?: string }) {
  const hover = {
    whileHover: { scale: 1.06, y: -2, boxShadow: "var(--shadow-lg)" as any },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 260, damping: 24 },
  };

  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Explore by style
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-3 sm:grid-cols-6 gap-6 place-items-center">
            <a href="#" className="group" aria-label="Explore style 1">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full bg-primary shadow-brand-md"
                {...hover}
              />
              <span className="sr-only">Style 1</span>
            </a>
            <a href="#" className="group" aria-label="Explore style 2">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full bg-accent shadow-brand-md"
                {...hover}
              />
              <span className="sr-only">Style 2</span>
            </a>
            <a href="#" className="group" aria-label="Explore style 3">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full bg-secondary shadow-brand-md"
                {...hover}
              />
              <span className="sr-only">Style 3</span>
            </a>
            <a href="#" className="group" aria-label="Explore style 4">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full shadow-brand-md"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--accent) 0%, var(--primary) 70%)",
                }}
                {...hover}
              />
              <span className="sr-only">Style 4</span>
            </a>
            <a href="#" className="group" aria-label="Explore style 5">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full shadow-brand-md"
                style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                }}
                {...hover}
              />
              <span className="sr-only">Style 5</span>
            </a>
            <a href="#" className="group" aria-label="Explore style 6">
              <motion.div
                className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full bg-muted shadow-brand-md"
                {...hover}
              />
              <span className="sr-only">Style 6</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
