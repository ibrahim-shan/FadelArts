"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Reveal from "@/components/reveal";

const ITEMS = [
  {
    imageSrc: "/hero-4.svg",
    title: "Golden Hour",
    artist: "D. Artist",
    price: 610,
    href: "/product/golden-hour",
  },
  {
    imageSrc: "/hero-2.svg",
    title: "Urban Echoes",
    artist: "B. Painter",
    price: 420,
    compareAtPrice: 520,
    href: "/product/urban-echoes",
  },
  {
    imageSrc: "/hero-1.svg",
    title: "Morning Light",
    artist: "A. Drawer",
    price: 350,
    href: "/product/morning-light",
  },
  {
    imageSrc: "/hero-3.svg",
    title: "Quiet Waters",
    artist: "C. Maker",
    price: 440,
    href: "/product/quiet-waters",
  },
  {
    imageSrc: "/hero-2.svg",
    title: "City Mist",
    artist: "E. Color",
    price: 390,
    href: "/product/city-mist",
  },
];

export default function BestSellers({ id = "best-sellers" }: { id?: string }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const positionsRef = useRef<number[]>([]);
  const [constraints, setConstraints] = useState<{ left: number; right: number }>({
    left: 0,
    right: 0,
  });
  const [visibleCount, setVisibleCount] = useState(1);
  const centerOffsetRef = useRef(0);

  const go = (dir: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const children = Array.from(node.children) as HTMLElement[];
    const last = children.length - 1;
    // Page-based navigation: jump by the number of visible items
    const step = Math.max(1, visibleCount);
    const targetIndex = dir > 0 ? Math.min(last, index + step) : Math.max(0, index - step);
    setIndex(targetIndex);
    const left = children[targetIndex]?.offsetLeft ?? 0;
    const c = centerOffsetRef.current;
    animate(x, -(left - c), { type: "spring", stiffness: 160, damping: 24 });
  };

  // Align and measure on mount and window resize without animation
  useEffect(() => {
    const measure = () => {
      const node = scrollerRef.current;
      const viewport = viewportRef.current;
      if (!node) return;
      const children = Array.from(node.children) as HTMLElement[];
      const positions = children.map((el) => el.offsetLeft);
      positionsRef.current = positions;
      const lastLeft = positions[positions.length - 1] ?? 0;
      // measure viewport/item to compute visible count first
      let viewportWidth = 0;
      let itemWidth = 0;
      if (viewport && children[0]) {
        viewportWidth = viewport.clientWidth;
        itemWidth = children[0].clientWidth;
      }
      const count = itemWidth > 0 ? Math.max(1, Math.round(viewportWidth / itemWidth)) : 1;
      setVisibleCount(count);

      // only center when a single card is visible (mobile)
      const centerOffset =
        count === 1 && itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
      centerOffsetRef.current = centerOffset;
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
          <div className="mb-12">
            <h2 className="text-center" style={{ fontFamily: "var(--font-heading)" }}>
              Best Sellers
            </h2>
          </div>
        </Reveal>

        <div className="relative">
          {/* Gradient edges for scroll hint */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent" />

          <Reveal>
            <div className="overflow-hidden py-3 md:py-0 touch-pan-y" ref={viewportRef}>
              <motion.div
                ref={scrollerRef}
                className="flex gap-6 pb-2 cursor-grab select-none transform-gpu"
                style={{ x, cursor: dragging ? "grabbing" : "grab", willChange: "transform" }}
                drag="x"
                dragElastic={0.04}
                dragMomentum={false}
                dragConstraints={constraints}
                onDragStart={() => setDragging(true)}
                onDragEnd={(_, info) => {
                  setDragging(false);
                  const positions = positionsRef.current;
                  if (!positions.length) return;
                  const currentX = x.get();
                  const c = centerOffsetRef.current;
                  // current left scroll position based on x and center offset
                  const leftNow = c - currentX;
                  // Predict next position using simple momentum from velocity (px/s)
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
                  animate(x, -(target - c), { type: "spring", stiffness: 170, damping: 26 });
                }}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {ITEMS.map((item, idx) => {
                  const isActive = idx === index;
                  return (
                    <motion.div
                      key={idx}
                      className="snap-start shrink-0 w-[76%] xs:w-[60%] sm:w-[42%] md:w-[32%] lg:w-[24%] transform-gpu"
                      animate={isActive ? { scale: 1.03, rotateZ: 0.25 } : { scale: 1, rotateZ: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    >
                      <ProductCard {...item} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </Reveal>

          {/* Page-based dots */}
          <Reveal>
            <div className="mt-4 flex items-center justify-center">
              {(() => {
                const totalPages = Math.max(1, Math.ceil(ITEMS.length / visibleCount));
                const currentPage = Math.floor(index / visibleCount);
                return (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, p) => (
                      <button
                        key={p}
                        aria-label={`Go to page ${p + 1}`}
                        onClick={() => {
                          const targetIndex = Math.min(ITEMS.length - 1, p * visibleCount);
                          setIndex(targetIndex);
                          const targetLeft = positionsRef.current[targetIndex] ?? 0;
                          const c = centerOffsetRef.current;
                          animate(x, -(targetLeft - c), {
                            type: "spring",
                            stiffness: 170,
                            damping: 26,
                          });
                        }}
                        className={`h-2.5 rounded-full transition-colors ${
                          p === currentPage ? "bg-primary w-6" : "bg-muted w-2.5 hover:bg-accent"
                        }`}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </Reveal>

          {/* Mobile controls removed per request */}

          {/* View more */}
          <div className="mt-8 flex items-center justify-center">
            <Button asChild>
              <Link href="/shop">View more</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
