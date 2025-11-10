"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Reveal from "@/components/reveal";

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  rating: number; // 1..5
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The curation is exceptional. Every piece feels considered and the experience is seamless.",
    name: "Layla M.",
    title: "Interior Designer",
    rating: 5,
  },
  {
    quote: "I found the perfect painting for my studio. Fast delivery and beautiful packaging.",
    name: "Omar K.",
    title: "Creative Director",
    rating: 5,
  },
  {
    quote: "Authentic, original works that elevate our gallery wall—highly recommend.",
    name: "Sara B.",
    title: "Homeowner",
    rating: 4,
  },
];

function Stars({ rating }: { rating: number }) {
  const items = Array.from({ length: 5 });
  return (
    <div className="mb-3 flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {items.map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${filled ? "text-primary fill-current" : "text-muted-foreground"}`}
          />
        );
      })}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="h-full border-border shadow-brand-sm">
      <CardContent className="p-6">
        <Stars rating={t.rating} />
        <p className="text-lg leading-relaxed mb-6">
          <span className="text-2xl mr-1 text-accent" aria-hidden>
            “
          </span>
          {t.quote}
          <span className="text-2xl ml-1 text-accent" aria-hidden>
            ”
          </span>
        </p>
        <div className="text-sm">
          <p className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.name}
          </p>
          <p className="text-muted-foreground">{t.title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Testimonials({ id = "testimonials" }: { id?: string }) {
  // Mobile carousel state
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const positionsRef = useRef<number[]>([]);
  const [constraints, setConstraints] = useState<{ left: number; right: number }>({
    left: 0,
    right: 0,
  });

  // Measure and center cards
  useEffect(() => {
    const measure = () => {
      const node = scrollerRef.current;
      const viewport = viewportRef.current;
      if (!node || !viewport) return;
      const children = Array.from(node.children) as HTMLElement[];
      const positions = children.map((el) => el.offsetLeft);
      positionsRef.current = positions;
      const lastLeft = positions[positions.length - 1] ?? 0;
      const viewportWidth = viewport.clientWidth;
      const itemWidth = children[0]?.clientWidth ?? 0;
      const centerOffset = itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
      setConstraints({ left: -(lastLeft - centerOffset), right: centerOffset });
      const currentLeft = positions[index] ?? 0;
      x.set(-(currentLeft - centerOffset));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Testimonials
          </h2>
        </Reveal>

        {/* Desktop grid */}
        <Reveal>
          <div className="hidden md:grid grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.05 }}
              >
                <TestimonialCard t={t} />
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* Mobile carousel */}
        <Reveal>
          <div className="md:hidden relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent" />

            <div className="overflow-hidden py-3" ref={viewportRef}>
              <motion.div
                ref={scrollerRef}
                className="flex gap-6 pb-2 cursor-grab select-none"
                drag="x"
                dragElastic={0.04}
                dragConstraints={constraints}
                style={{ x, cursor: "grab" }}
                onDragEnd={(_, info) => {
                  const positions = positionsRef.current;
                  if (!positions.length) return;
                  const viewport = viewportRef.current;
                  const node = scrollerRef.current;
                  const children = node ? (Array.from(node.children) as HTMLElement[]) : [];
                  const viewportWidth = viewport?.clientWidth ?? 0;
                  const itemWidth = children[0]?.clientWidth ?? 0;
                  const centerOffset =
                    itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
                  const currentX = x.get();
                  const leftNow = centerOffset - currentX;
                  const predictedLeft = leftNow - info.velocity.x * 0.2;
                  let nearestIndex = 0;
                  let nearestDist = Infinity;
                  positions.forEach((pos, i) => {
                    const d = Math.abs(pos - predictedLeft);
                    if (d < nearestDist) {
                      nearestDist = d;
                      nearestIndex = i;
                    }
                  });
                  setIndex(nearestIndex);
                  const target = positions[nearestIndex] ?? 0;
                  animate(x, -(target - centerOffset), {
                    type: "spring",
                    stiffness: 170,
                    damping: 26,
                  });
                }}
              >
                {TESTIMONIALS.map((t, i) => (
                  <motion.div
                    key={i}
                    className="shrink-0 w-[85%]"
                    animate={i === index ? { scale: 1.03, rotateZ: 0.2 } : { scale: 1, rotateZ: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  >
                    <TestimonialCard t={t} />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => {
                    setIndex(i);
                    const targetLeft = positionsRef.current[i] ?? 0;
                    const viewport = viewportRef.current;
                    const node = scrollerRef.current;
                    const children = node ? (Array.from(node.children) as HTMLElement[]) : [];
                    const viewportWidth = viewport?.clientWidth ?? 0;
                    const itemWidth = children[0]?.clientWidth ?? 0;
                    const centerOffset =
                      itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
                    animate(x, -(targetLeft - centerOffset), {
                      type: "spring",
                      stiffness: 170,
                      damping: 26,
                    });
                  }}
                  className={`h-2.5 rounded-full ${i === index ? "bg-primary w-6" : "bg-muted w-2.5 hover:bg-accent"}`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
